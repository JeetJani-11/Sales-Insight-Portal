import { Router } from "express";
import axios from "axios";
import { snowflakeConnection } from "../index.js";
import { extractJsonBlock } from "../utils/extractJsonBlock.js";
import { ChromaClient } from "chromadb";
import { Openperplex } from "openperplex-js";
import { redisClient } from "../index.js";

const client = new Openperplex(process.env.OPENPREPLEX);
const chromaClient = new ChromaClient();
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

    const cacheKey = `analytics:strategy:${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }
    const result = await client.search(
      `We are an industrial company that ##Product Info##  to the company called ${accountName}. Analayze all the recent updates and now analayze all my recent conversation with these account. Give me a conscise strategy in order to close this opportunity.  Can you provide me with a stratergy for the product based on what company does? Here is the information about the company: ${accountInfo}.Here is the information about the opportunities: ${opportunities}.Here is the information about the recent activities: ${recentActivities}`,
      {
        date_context: "today is 23 March 2025 and the time is 1 PM",
        location: "us",
        model: "gpt-4o-mini",
        response_language: "auto",
        answer_type: "text",
        search_type: "news",
        return_citations: false,
        return_sources: false,
        return_images: false,
        recency_filter: "month",
      }
    );

    let messagesVP = result.llm_response;

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

    const collection = await chromaClient.getOrCreateCollection({
      name: "value_proposition",
    });
    const documents = data.map((doc) => JSON.stringify(doc));
    const ids = data.map((_, i) => String(i));
    await collection.upsert({ documents, ids });

    const queryResults = await collection.query({
      queryTexts: [
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
      try {
        const openAiPayload = {
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: messages,
        };
        const openAiHeaders = {
          Authorization: `Bearer ${process.env.OPENROUTERDEEPSEEK}`,
        };
        const openAiResponse = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
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

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        stratergy: messagesVP,
        insights: insights,
      }),
      {
        EX: 60 * 60 * 24 * 1000,
      }
    );

    return res.json({ stratergy: messagesVP, insights: insights });
  } catch (e) {
    console.error("Failed to fetch value proposition:", e);
    return res.json({ error: "Failed to fetch value proposition" });
  }
});

export default router;
