import { Router } from "express";
import { snowflakeConnection } from "../index.js";
import { redisClient } from "../index.js";

const router = Router();

router.post("/accountDetails", async (req, res) => {
  try {
    const { accountName } = req.body;
    console.log("Fetching account details for", accountName);
    const cacheKey = `analytics:accountDetails-${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }
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
                        WHERE NAME = '${accountName}'
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
                                    'ThreadId', em.THREAD_IDENTIFIER,
                                    'RelatedToId', em.RELATED_TO_ID,
                                    'ReplyToEmailMessageId', em.REPLY_TO_EMAIL_MESSAGE_ID
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
                    ),
                    Events AS (
                        SELECT 
                            ACCOUNT_ID,
                            ARRAY_AGG(OBJECT_CONSTRUCT(*)) AS events
                        FROM PC_FIVETRAN_DB.SALESFORCE.EVENT 
                        WHERE ACCOUNT_ID = (SELECT ID FROM AccountData)
                        GROUP BY ACCOUNT_ID
                    ),
                    Owner AS (
                        SELECT 
                            ad.ID AS account_id,
                            OBJECT_CONSTRUCT(u.*) AS owner
                        FROM PC_FIVETRAN_DB.SALESFORCE.USER u
                        JOIN AccountData ad ON u.ID = ad.OWNER_ID
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
                            'Emails', COALESCE(
                                OBJECT_AGG(ec.CONTACT_ID, ec.EMAILS),
                                OBJECT_CONSTRUCT()
                            ),
                            'Events', COALESCE(ANY_VALUE(ev.events), ARRAY_CONSTRUCT()),
                            'Owner', COALESCE(ANY_VALUE(own.owner), OBJECT_CONSTRUCT())
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
                    LEFT JOIN EmailContacts ec ON ad.ID = ec.ACCOUNT_ID
                    LEFT JOIN Events ev ON ad.ID = ev.ACCOUNT_ID
                    LEFT JOIN Owner own ON ad.ID = own.account_id
                    GROUP BY ad.ID;

                `;
            snowflakeConnection.execute({
              sqlText: query,
              binds: [accountName],
              complete: async (err, stmt, rows) => {
                console.log(rows);
                if (err) {
                  console.error("Error executing query:", err);
                  return res
                    .status(500)
                    .json({ error: "Failed to fetch account details" });
                }
                if (rows && rows.length > 0) {
                  const data = rows[0];
                  const account = data.RESULT.Account;
                  const contacts = data.RESULT.Contacts;
                  const events = data.RESULT.Events;
                  const emailMessagesGroupedByContact = data.RESULT.Emails;
                  const opportunities = data.RESULT.Opportunities;
                  const owner = data.RESULT.Owner;
                  // console.log("uniqueEmailMessages",  uniqueEmailMessages);
                  const uniqueEmailMessages = [];
                  Object.keys(emailMessagesGroupedByContact).forEach((key) => {
                    const emails = emailMessagesGroupedByContact[key];
                    emails.forEach((email) => {
                      uniqueEmailMessages.push(email);
                    });
                  });
                  const emailMessagesGroupedByOpportunity = {};
                  opportunities.forEach((o) => {
                    emailMessagesGroupedByOpportunity[o.ID] = [];
                  });
                  uniqueEmailMessages.forEach((email) => {
                    const opportunityId = email.RelatedToId;
                    if (emailMessagesGroupedByOpportunity[opportunityId]) {
                      emailMessagesGroupedByOpportunity[opportunityId].push(
                        email
                      );
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

                  await redisClient.set(
                    cacheKey,
                    JSON.stringify(accountDetails),
                    {
                      EX: 60*60*24*1000,
                    }
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

export default router;
