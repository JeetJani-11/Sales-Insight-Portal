import { Router } from "express";
import { snowflakeConnection } from "../index";

const router = Router();

router.post("/accountDetails", async (req, res) => {
  try {
    const accountName = req.body.accountName;
    const cacheKey = `analytics:accountDetails-${accountName}`;

    snowflakeConnection.execute({
      sqlText: "USE DATABASE PC_FIVETRAN_DB",
      complete: (err) => {
        if (err) {
          console.error("Error using database:", err);
          return res.status(500).json({ error: "Failed to use database" });
        }
        snowflakeConnection.execute({
          sqlText: "USE WAREHOUSE PC_FIVETRAN_WH",
          complete: (err) => {
            if (err) {
              console.error("Error using warehouse:", err);
              return res.status(500).json({ error: "Failed to use warehouse" });
            }
            const query = `
                  WITH AccountData AS (
                        SELECT * 
                        FROM PC_FIVETRAN_DB.SALESFORCE.ACCOUNT 
                        WHERE NAME = ${accountName}
                    ),
                    EmailContacts AS (
                        SELECT 
                            c.ACCOUNT_ID,
                            c.ID AS CONTACT_ID,
                            ARRAY_AGG(
                                OBJECT_CONSTRUCT(
                                    'EmailId', em.ID,
                                    'Subject', em.SUBJECT,
                                    'Body', em.TEXT_BODY,
                                    'From', em.FROM_ADDRESS,
                                    'To', em.TO_ADDRESS,
                                    'Date', em.MESSAGE_DATE,
                                    'OpportunityId', em.RELATED_TO_ID,
                                    'ThreadId', em.THREAD_IDENTIFIER
                                )
                            ) AS EMAILS
                        FROM PC_FIVETRAN_DB.SALESFORCE.EMAIL_MESSAGE_RELATION emr
                        JOIN PC_FIVETRAN_DB.SALESFORCE.EMAIL_MESSAGE em
                            ON emr.EMAIL_MESSAGE_ID = em.ID
                        JOIN PC_FIVETRAN_DB.SALESFORCE.CONTACT c
                            ON emr.RELATION_ID = c.ID
                        WHERE em.RELATED_TO_ID IN (
                            SELECT ID 
                            FROM PC_FIVETRAN_DB.SALESFORCE.OPPORTUNITY 
                            WHERE ACCOUNT_ID = (SELECT ID FROM AccountData)
                        )
                        GROUP BY c.ACCOUNT_ID, c.ID
                    )
                    SELECT
                        OBJECT_CONSTRUCT(
                            'Account', OBJECT_CONSTRUCT(
                                'ID', ANY_VALUE(ad.ID),
                                'Name', ANY_VALUE(ad.NAME),
                                'Type', ANY_VALUE(ad.TYPE),
                                'Industry', ANY_VALUE(ad.INDUSTRY),
                                'Phone', ANY_VALUE(ad.PHONE),
                                'Website', ANY_VALUE(ad.WEBSITE)
                            ),
                            'Contacts', COALESCE(ANY_VALUE(c.contacts), ARRAY_CONSTRUCT()),
                            'Opportunities', COALESCE(ANY_VALUE(op.opportunities), ARRAY_CONSTRUCT()),
                            'Emails',  COALESCE(
                                    OBJECT_AGG(ec.CONTACT_ID, ec.EMAILS),
                                    OBJECT_CONSTRUCT()
                                )
                            
                        ) AS result
                    FROM AccountData ad
                    LEFT JOIN (
                        SELECT 
                            ACCOUNT_ID, 
                            ARRAY_AGG(OBJECT_CONSTRUCT(*)) AS contacts
                        FROM PC_FIVETRAN_DB.SALESFORCE.CONTACT
                        GROUP BY ACCOUNT_ID
                    ) c ON ad.ID = c.ACCOUNT_ID
                    LEFT JOIN (
                        SELECT 
                            ACCOUNT_ID, 
                            ARRAY_AGG(OBJECT_CONSTRUCT(*)) AS opportunities
                        FROM PC_FIVETRAN_DB.SALESFORCE.OPPORTUNITY
                        GROUP BY ACCOUNT_ID
                    ) op ON ad.ID = op.ACCOUNT_ID
                    LEFT JOIN EmailContacts ec
                        ON ad.ID = ec.ACCOUNT_ID
                    GROUP BY ad.ID;

                `;
            snowflakeConnection.execute({
              sqlText: query,
              binds: [accountName],
              complete: (err, stmt, rows) => {
                if (err) {
                  console.error("Error executing query:", err);
                  return res
                    .status(500)
                    .json({ error: "Failed to fetch account details" });
                }
                if (rows && rows.length > 0) {
                  const data = rows[0]; // assuming first row
                  // Parse JSON fields if needed.
                  const account = data.ACCOUNT ? JSON.parse(data.ACCOUNT) : {};
                  const contacts = data.CONTACTS
                    ? JSON.parse(data.CONTACTS)
                    : [];
                  const events = data.EVENTS ? JSON.parse(data.EVENTS) : [];
                  const uniqueEmailMessages = data.UNIQUE_EMAIL_MESSAGES
                    ? JSON.parse(data.UNIQUE_EMAIL_MESSAGES)
                    : [];
                  const uniqueEmailMessagesGroupedByContact =
                    data.UNIQUE_EMAIL_MESSAGES_GROUPED_BY_CONTACT
                      ? JSON.parse(
                          data.UNIQUE_EMAIL_MESSAGES_GROUPED_BY_CONTACT
                        )
                      : [];
                  const opportunities = data.OPPORTUNITIES
                    ? JSON.parse(data.OPPORTUNITIES)
                    : [];
                  const owner = data.OWNER ? JSON.parse(data.OWNER) : {};

                  // Group email messages by opportunity and contact.
                  const emailMessagesGroupedByOpportunity = {};
                  opportunities.forEach((o) => {
                    emailMessagesGroupedByOpportunity[o.ID] = [];
                  });
                  const emailMessagesGroupedByContact = {};
                  contacts.forEach((c) => {
                    emailMessagesGroupedByContact[c.ID] = [];
                  });
                  uniqueEmailMessages.forEach((email) => {
                    const opportunityId = email.RelatedToId;
                    if (emailMessagesGroupedByOpportunity[opportunityId]) {
                      emailMessagesGroupedByOpportunity[opportunityId].push(
                        email
                      );
                    }
                  });
                  uniqueEmailMessagesGroupedByContact.forEach((email) => {
                    const contactId = email.RelationId;
                    if (emailMessagesGroupedByContact[contactId]) {
                      emailMessagesGroupedByContact[contactId].push(email);
                    }
                  });

                  const accountDetails = {
                    account,
                    contacts,
                    events,
                    emailMessages: emailMessagesGroupedByOpportunity,
                    opportunities,
                    emailMessagesGroupedByContact,
                    owner,
                  };

                  redisClient.setex(
                    cacheKey,
                    30 * 60,
                    JSON.stringify(accountDetails)
                  );
                  console.log(
                    "Successfully fetched account details from Snowflake for",
                    accountName
                  );
                  return res.json(accountDetails);
                } else {
                  return res.json({ error: "No data found" });
                }
              },
            });
          },
        });
      },
    });
  } catch (error) {
    console.error("Failed to fetch account details:", error);
    return res.status(500).json({
      error: "Failed to fetch account details",
      errorMessage: error.toString(),
    });
  }
});
