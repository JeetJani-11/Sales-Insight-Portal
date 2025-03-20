import { Router } from "express";
import axios from "axios";
import { snowflakeConnection } from "../index";
import { extractJsonBlock } from "../utils/extractJsonBlock";

const router = Router();
function executeQuery(query, binds = []) {
  return new Promise((resolve, reject) => {
    snowflakeConnection.execute({
      sqlText: query,
      binds: binds,
      complete: (err, stmt, rows) => {
        if (err) {
          return reject(err);
        }
        resolve({ stmt, rows });
      },
    });
  });
}

router.post("/strategy", async (req, res) => {
  try {
    const { accountName, accountInfo, opportunities, recentActivities } =
      req.body;
    const perplexityApiKey =
      "perplexity-api-key"; 
    const perplexityUrl = "https://api.perplexity.ai/chat/completions";
    const perplexityPayload = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "user",
          content: `We are an industrial company that ##Product Info##  to the company called ${accountName}. Analayze all the recent updates and now analayze all my recent conversation with these account. Give me a conscise strategy in order to close this opportunity.  Can you provide me with a stratergy for the product based on what company does? Here is the information about the company: ${accountInfo}.Here is the information about the opportunities: ${opportunities}.Here is the information about the recent activities: ${recentActivities}`,
        },
      ],
      stream: false,
    };
    const perplexityHeaders = {
      Authorization: `Bearer ${perplexityApiKey}`,
      "Content-Type": "application/json",
    };

    const perplexityResponse = await axios.post(
      perplexityUrl,
      perplexityPayload,
      { headers: perplexityHeaders }
    );
    const choices = perplexityResponse.data.choices;
    let messagesVP = "";
    choices.forEach((choice) => {
      messagesVP += (choice.message && choice.message.content) || "";
    });

    await executeQuery("USE DATABASE PC_FIVETRAN_DB");
    await executeQuery("USE WAREHOUSE PC_FIVETRAN_WH");

    const oppQuery = `
      SELECT op.ID AS OPPORTUNITY_ID, op.NAME as OPPORTUNITY_NAME, op.*, ac.*
      FROM PC_FIVETRAN_DB.SALESFORCE.OPPORTUNITY AS op
      LEFT JOIN PC_FIVETRAN_DB.SALESFORCE.ACCOUNT AS ac
        ON op.ACCOUNT_ID = ac.ID
      WHERE op.IS_CLOSED = TRUE
    `;
    const { rows: oppRows } = await executeQuery(oppQuery);
    let data = [];
    if (oppRows && oppRows.length > 0) {
      data = oppRows;
    }

    const collection = await client.getOrCreateCollection("value_proposition");
    const documents = data.map((doc) => JSON.stringify(doc));
    const ids = data.map((_, i) => String(i));
    await collection.add({ documents, ids });

    const queryResults = await collection.query({
      query_texts: [
        `Which opportunity is closed and related to the account similar to the company ${accountName}`,
      ],
      n_results: data.length < 3 ? data.length : 3,
    });
    
    const docsResult = queryResults.documents ? queryResults.documents[0] : [];
    const opportunitiesFromDB = docsResult.map((doc) => JSON.parse(doc));
    const oppIds = opportunitiesFromDB.map((o) => o.OPPORTUNITY_ID);

    while (oppIds.length < 3) {
      oppIds.push(null);
    }
    const emailQuery = `
      SELECT em.ID, em.SUBJECT, em.TEXT_BODY, em.FROM_ADDRESS, em.TO_ADDRESS, em.RELATED_TO_ID
      FROM PC_FIVETRAN_DB.SALESFORCE.EMAIL_MESSAGE em 
      WHERE em.RELATED_TO_ID IN (?, ?, ?)
    `;
    const { rows: emailRows } = await executeQuery(
      emailQuery,
      oppIds.slice(0, 3)
    );
    let emailData = emailRows && emailRows.length > 0 ? emailRows : [];

    const emailByOpportunity = {};
    opportunitiesFromDB.forEach((o) => {
      emailByOpportunity[o.OPPORTUNITY_ID] = [];
    });
    emailData.forEach((email) => {
      const oppId = email.RELATED_TO_ID;
      if (emailByOpportunity[oppId]) {
        emailByOpportunity[oppId].push(email);
      }
    });
    let insights = [];
    for (const opp of opportunitiesFromDB) {
      const messages = [
        {
          role: "system",
          content:
            "Extract key insights into challenges, strategies, relationship factors, outcomes, and market trends from provided sales opportunity and related email. Format the response as follows: { 'Challenges': { 'Objections': 'Client concerns', 'Competitors': 'Rivals considered', 'Internal': 'Resource/pricing issues' }, 'Strategies': { 'Approach': 'Sales style', 'Value': 'Key selling points', 'Tactics': 'Demos, trials, etc.' }, 'Relationship': { 'Touchpoints': 'Communication frequency', 'Engagement': 'Events, outreach' }, 'Outcome': { 'Result': 'Key metrics', 'Feedback': 'Client reviews', 'Potential': 'Upsell opportunities' }, 'Insights': { 'Success': 'What worked', 'Improvement': 'What to avoid', 'Trends': 'Market patterns' } }. Use the given opportunity details and emails to populate this structure accurately with concise, relevant information. Only JSON format is accepted.",
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${JSON.stringify(
            emailByOpportunity[opp.OPPORTUNITY_ID]
          )}`,
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${JSON.stringify(
            opp
          )}`,
        },
      ];

      const openAiApiKey =
        "openai-api-key";
      try {
        const openAiPayload = {
          model: "gpt-4o",
          messages: messages,
          temperature: 0.5,
        };
        const openAiHeaders = { Authorization: `Bearer ${openAiApiKey}` };
        const openAiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          openAiPayload,
          { headers: openAiHeaders }
        );
        const openAiChoices = openAiResponse.data.choices;
        let insight = {};
        for (const choice of openAiChoices) {
          let messageContent = (choice.message && choice.message.content) || "";
          try {
            insight = JSON.parse(messageContent);
          } catch (e) {
            try {
              const extracted = extractJsonBlock(messageContent);
              insight = JSON.parse(extracted);
            } catch (err) {
              console.error(
                "Something went wrong in ValueProposition in choices loop.",
                err
              );
              return res.json({ error: "Something went wrong." });
            }
          }
        }
        insights.push({ opportunity: opp, overview: insight });
      } catch (err) {
        console.error(
          "Failed to fetch insights from OpenAI in ValueProposition.",
          err
        );
        return res.json({ error: "Something went wrong." });
      }
    }
    return res.json({ stratergy: messagesVP, insights: insights });
  } catch (e) {
    console.error("Failed to fetch value proposition:", e);
    return res.json({ error: "Failed to fetch value proposition" });
  }
});
