import { Router } from "express";
import axios from "axios";
import { Openperplex } from "openperplex-js";
import { redisClient } from "../index.js";
const router = Router();
const client = new Openperplex(process.env.OPENPREPLEX);
router.post("/recentUpdates", async (req, res) => {
  try {
    let accountName = req.body.accountDetails.Name;
    const cacheKey = `analytics:recentUpdates:${accountName}`;

    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log("Cache hit for", accountName);
      return res.json(JSON.parse(cachedResult));
    }
    const result = await client.search(
      `Give me all the latest news/update for the company called ${accountName}`,
      {
        date_context: "today is 23 March 2025 and the time is 1 PM",
        location: "us",
        model: "gpt-4o-mini",
        response_language: "auto",
        answer_type: "text",
        search_type: "news",
        return_citations: false,
        return_sources: true,
        return_images: false,
        recency_filter: "month",
      }
    );

    const metaData = await Promise.all(
      result.sources.map(async (update) => {
        try {
          const response = await axios.get(
            `https://api.linkpreview.net/?key=${process.env.LINKPREVIEWKEY}&q=${update.link}`
          );
          return response.data;
        } catch (e) {
          console.error(`Failed to fetch metadata for ${update.link}:`, e.message);
          return null; 
        }
      })
    );
    
    const filteredMetaData = metaData.filter((data) => data !== null);
    await redisClient.set(
      cacheKey,
      JSON.stringify({
        updates: filteredMetaData,
      }),
      {
        EX: 60 * 60 * 24 * 1000,
      }
    );

    return res.json({
      updates: filteredMetaData,
    });
  } catch (err) {
    console.error("Error getting recent updates", err);
    return res.status(500).json({ error: "Failed to get recent updates" });
  }
});

export default router;
