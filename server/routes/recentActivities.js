import { Router } from "express";
import axios from "axios";
import { extractJsonBlock } from "../utils/extractJsonBlock.js";
import { groupEmailsByThread } from "../utils/groupEmailsByThread.js";
import { redisClient } from "../index.js";
const router = Router();

router.post("/recentActivities", async (req, res) => {
  try {
    const { accountName, emailMessages, events, opportunityId } = req.body;
    const cacheKey = `analytics:recentActivities:${opportunityId}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }
    const emailMessagesGroupedByThread = groupEmailsByThread(emailMessages);
    let latestThreads = [];
    for (const threadId in emailMessagesGroupedByThread) {
      const emails = emailMessagesGroupedByThread[threadId];
      const lastEmailOfThread = emails[emails.length - 1];
      const lastEmailDate = lastEmailOfThread.Date;
      latestThreads.push({
        threadId,
        lastEmailDate,
        emails,
      });
    }
    latestThreads.sort((a, b) => {
      const dateA = new Date(a.lastEmailDate.slice(0, -6));
      const dateB = new Date(b.lastEmailDate.slice(0, -6));
      return dateB - dateA;
    });
    latestThreads = latestThreads.slice(0, 3);
    latestThreads = latestThreads.map(
      (item) => emailMessagesGroupedByThread[item.threadId]
    );
    const currentTime = new Date();
    let filteredEvents = events.filter((event) => {
      const eventEnd = new Date(event.END_DATE_TIME.slice(0, -6));
      return currentTime <= eventEnd;
    });

    filteredEvents.sort((a, b) => {
      const dateA = new Date(a.END_DATE_TIME.slice(0, -6));
      const dateB = new Date(b.END_DATE_TIME.slice(0, -6));
      return dateB - dateA;
    });
    const recentEvents = filteredEvents.slice(0, 3);
    const messageContent = `I am sales agent for the company called ${accountName}. Can you provide me with the recent activities of the deal? Here is the information about the email you are researching: ${JSON.stringify(
      latestThreads
    )} ${JSON.stringify(
      recentEvents
    )}. Two updates from email and two from event.Response should be strictly in json in following format - { "updates" : [{ "update" : "Description of Update. One Sentece.(type - string)" ,"source" : "1 for event and 2 for email(type - int)", "date" : "Date Month(in string), Year" (type-string eg - "10 January, 2025"))"}] }`;

    const messages = [
      {
        role: "user",
        content: messageContent,
      },
    ];

    const payload = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: messages,
    };
    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTERDEEPSEEK}`,
    };

    const openAiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      { headers }
    );
    const response_json = openAiRes.data;
    const choices = response_json.choices;
    let updates = [];

    for (const choice of choices) {
      let message = (choice.message && choice.message.content) || "";
      let update;
      try {
        update = JSON.parse(message).updates;
      } catch (e) {
        try {
          const extracted = extractJsonBlock(message);
          update = JSON.parse(extracted).updates;
        } catch (err) {
          console.error(
            "Something went wrong in RecentActivities in choices loop.",
            err
          );
          return res.json({ error: "Something went wrong." });
        }
      }
      updates = updates.concat(update);
    }

    await redisClient.set(cacheKey, JSON.stringify({ updates }), {
      EX: 60 * 60 * 24 * 1000,
    });

    console.log("Successfully fetched recent activities for", accountName);
    return res.json({ updates: updates });
  } catch (e) {
    console.error("Failed to fetch recent activities:", e);
    return res.json({ error: "Failed to fetch recent activities" });
  }
});

export default router;
