import { Router } from "express";
import { db, redisClient } from "../services/db";

const router = Router();

function normalizeTuzla(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    airport: doc.airport,
    date: doc.date ?? "",
    type: doc.type,
    time: doc.time,
    airline: doc.airline,
    city: doc.city,
    iata: doc.iata,
  };
}

router.get("/tuzla", async (req, res) => {
  try {
    const cacheKey = "flights:tuzla";
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const raw = JSON.parse(cached) as Record<string, unknown>[];
      return res.json(raw.map(normalizeTuzla));
    }

    const flights = await db.collection("flights").find({ airport: "Tuzla" }).toArray();
    if (flights.length > 0) {
      const normalized = flights.map((doc) => normalizeTuzla(doc as Record<string, unknown>));
      await redisClient.set(cacheKey, JSON.stringify(normalized), "EX", 86400);
      return res.json(normalized);
    }

    res.status(503).json({ error: "No flight data. Run the scrape script: npm run scrape:tuzla" });
  } catch (err) {
    console.error("Flights error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: "Internal Server Error", detail: message });
  }
});

router.get("/banjaluka", async (req, res) => {
  try {
    const cacheKey = "flights:banjaluka";
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const flights = await db.collection("flights").find({ airport: "Banja Luka" }).toArray();
    if (flights.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(flights), "EX", 86400);
      return res.json(flights);
    }

    res.status(503).json({ error: "No flight data. Run the scrape script: npm run scrape:banjaluka" });
  } catch (err) {
    console.error("Flights error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: "Internal Server Error", detail: message });
  }
});

router.get("/mostar", async (req, res) => {
  try {
    const cacheKey = "flights:mostar";
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const flights = await db.collection("flights").find({ airport: "Mostar" }).toArray();
    if (flights.length > 0) {
      await redisClient.set(cacheKey, JSON.stringify(flights), "EX", 86400);
      return res.json(flights);
    }

    res.status(503).json({ error: "No flight data. Run the scrape script: npm run scrape:mostar" });
  } catch (err) {
    console.error("Flights error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: "Internal Server Error", detail: message });
  }
});

export default router;