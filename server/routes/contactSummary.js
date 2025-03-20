import { Router } from "express";
import axios from "axios";
import { groupEmailsByThread } from "../utils/groupEmailsByThread";

const router = Router();

router.post("/contactSummary", async (req, res) => {
  try {
    const emailMessages = req.body.emailMessages;
    const contactInfo = req.body.contact;
    const emailMessagesGroupedByThread = groupEmailsByThread(emailMessages);
    let latestThreads = [];
    for (const threadId in emailMessagesGroupedByThread) {
      const emails = emailMessagesGroupedByThread[threadId];
      const lastEmailOfThread = emails[emails.length - 1];
      const lastEmailDate = lastEmailOfThread.MessageDate;
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
    const messages = [
      {
        role: "user",
        content:
          "I am salesagent. Help me to summarize the conversation with the customer. Respons should be at max 3 sentences with no pre-text. Here is the information about the email you are researching: " +
          JSON.stringify(latestThreads),
      },
    ];
    const openAiApiKey = "sk-proj-59wceY...";
    const payload = {
      model: "gpt-4o",
      messages: messages,
      temperature: 0.5,
    };
    const headers = {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    };

    const openAiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      { headers }
    );
    const choices = openAiResponse.data.choices;
    let updates = "";
    choices.forEach((choice) => {
      updates +=
        " " +
        (choice.message && choice.message.content
          ? choice.message.content
          : "");
    });

    await redisClient.set(
      cacheKey,
      JSON.stringify({ update: updates }),
      "EX",
      30 * 60
    );
    console.log("Successfully fetched contact summary for", contactInfo.ID);
    return res.json({ update: updates });
  } catch (e) {
    console.error("Failed to fetch contact summary", e);
    return res.json({ error: "Failed to fetch value proposition" });
  }
});
