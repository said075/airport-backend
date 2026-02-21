import { Router } from "express";
import { scrapeTuzlaFlights } from "../scraper/tuzla";
import { db, redisClient } from "../services/db";

const router = Router();

router.get("/tuzla", async (req, res) => {
  try {
    const cacheKey = "flights:tuzla";
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const flights = await scrapeTuzlaFlights();

    // Ubaci u MongoDB
    await db.collection("flights").insertMany(flights);
    await redisClient.set(cacheKey, JSON.stringify(flights), "EX", 600); // 10 min cache

    res.json(flights);
  } catch (err) {
    console.error("Flights error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: "Internal Server Error", detail: message });
  }
});

export default router;