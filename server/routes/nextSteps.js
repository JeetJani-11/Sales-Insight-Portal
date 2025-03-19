import { Router } from "express";
import axios from "axios";
import { ChromaClient } from "chromadb";
const client = new ChromaClient();

const router = Router();
function extractJsonBlock(text) {
  const pattern = /```json([\s\S]*?)```/;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}
function groupEmailByThread(emails) {
  try {
    if (!emails || emails.length === 0) {
      return {};
    }
    let threads = {};
    for (let email of emails) {
      if (email.ThreadIdentifier in threads) {
        threads[email.ThreadIdentifier].push(email);
      } else {
        threads[email.ThreadIdentifier] = [email];
      }
    }
    let orderedEmailsByThread = {};
    for (let thread in threads) {
      let threadEmails = threads[thread];
      let startEmail = null;
      for (let email of threadEmails) {
        if (email.ReplyToEmailMessageId == null) {
          startEmail = email;
          break;
        }
      }
      if (startEmail == null) {
        console.error("No start email found for thread", thread);
        continue;
      }
      let orderedEmails = [];
      let currentEmail = startEmail;
      while (currentEmail != null) {
        orderedEmails.push(currentEmail);
        let nextEmailId = currentEmail.MessageIdentifier;
        currentEmail = null;
        for (let email of threadEmails) {
          if (email.ReplyToEmailMessageId == nextEmailId) {
            currentEmail = email;
            break;
          }
        }
      }
      orderedEmailsByThread[thread] = orderedEmails;
    }
    return orderedEmailsByThread;
  } catch (err) {
    console.error("Error grouping emails by thread", err);
  }
}
router.post("/nextSteps", async (req, res) => {
  try {
    const { opportunityId, emailDetails, contactDetails } = req.body;
    const orderedEmailsByThread = groupEmailByThread(emailDetails);
    let conversations = [];
    for (let thread in orderedEmailsByThread) {
      let emails = orderedEmailsByThread[thread];
      let conversation = "";
      for (let email of emails) {
        const role = contactDetails.some((i) => i.EMAIL === email.FromAddress)
          ? "customer"
          : "salesAgent";
        conversation += `${role}: ${email.TextBody}\n`;
        conversations.push(conversation);
      }
      const collection = await client.getOrCreateCollection({
        name: "nextSteps",
      });
      await collection.upsert({
        documents: conversations,
        ids: Array.from({ length: conversations.length }, (_, i) => String(i)),
      });
      const result = await collection.query({
        queryTexts: [
          "What are the next steps yet to be done by Sales representative?",
        ],
        nResults: conversations.length > 3 ? 3 : conversations.length,
      });
      if (result.ids.length === 0) {
        return res.status(404).json({ error: "No next steps found" });
      }
      let ids = result.ids[0];
      let finalConversations = [];
      for (let id of ids) {
        finalConversations.push(conversations[id]);
      }
      let messages = [
        {
          role: "system",
          content:
            'Based on the information provided, suggest the next steps sales agent should take to move the deal forward. Include the key actions sales agent should take, the stakeholders sales agent should engage with, and the timeline for each action. Provide your suggestions as an array of next steps in JSON format, where each step is a string: { "summary" : "Overall Summary of what to do next goes here." , "nextSteps": ["step 1", "step 2", ...] }. Please ensure the output to be structured as specified, without any extra narrative or introductory text.',
        },
        {
          role: "user",
          content: `Here is the information about the email you are researching: ${finalConversations}`,
        },
      ];
      try {
        let payload = {
          model: "gpt-4o",
          messages: messages,
          temperature: 0.5,
        };
        let headers = {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        };
        let response = await axios.post(
          "https://api.openai.com/v1/engines/davinci-codex/completions",
          payload,
          { headers: headers }
        );
        let choices = response.data.choices;
        let summary = "Something went wrong. Please try again.";
        let nextSteps = [];
        for (let choice of choices) {
          let messageContent = (choice.message && choice.message.content) || "";
          try {
            messageContent = JSON.parse(messageContent);
          } catch (e) {
            try {
              const extracted = extractJsonBlock(messageContent);
              messageContent = JSON.parse(extracted);
            } catch (err) {
              console.log(
                "Something went wrong in NextSteps in choices loop.",
                err
              );
              return res.json({ error: "Something went wrong." });
            }
          }
          nextSteps = messageContent.nextSteps;
          summary = messageContent.summary;
        }
        return res.json({ nextSteps, summary });
      } catch (err) {
        console.error("Error getting next steps", err);
        return res.status(500).json({ error: "Failed to get next steps" });
      }
    }
  } catch (err) {
    console.error("Error getting next steps", err);
    return res.status(500).json({ error: "Failed to get next steps" });
  }
});
