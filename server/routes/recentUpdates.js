import { Router } from "express";
import axios from "axios";
import { Openperplex } from "openperplex-js";
const router = Router();
const client = new Openperplex(process.env.OPENPREPLEX);
router.get("/recentUpdates", async (req, res) => {
  try {
    let accountName = req.query.accountName;
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

    await redisClient.set(
      cacheKey,
      JSON.stringify({
        updates: result.sources,
      }),
      {
        EX: 60 * 60 * 24 * 1000,
      }
    );

    return res.json({
      updates: result.sources,
    });
  } catch (err) {
    console.error("Error getting recent updates", err);
    return res.status(500).json({ error: "Failed to get recent updates" });
  }
});

export default router;
