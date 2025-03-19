import { Router } from "express";
import axios from "axios";
const router = Router();

router.get("/recentUpdates", async (req, res) => {
  try {
    let accountName = req.query.accountName;
    let perplexityApiKey = "your-perplexity-api-key";

    const response = await axios.post(
      `https://api.perplexity.ai/chat/completions`,
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "user",
            content: `Give me all the latest news/update for the company called ${accountName}.`,
          },
        ],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${perplexityApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    let metaData = [];
    for (const citation of response.data.citations) {
      let metaData = await axios.get(
        `https://api.linkpreview.net/?key=842d5a9e5de0e92a9047f0460530176f&q=${citation}`
      );
      if (metaData.data.error) {
        continue;
      }
      metaData.push(metaData.data);
    }
    res.json({
      metaData: metaData,
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error getting recent updates", err);
    return res.status(500).json({ error: "Failed to get recent updates" });
  }
});
