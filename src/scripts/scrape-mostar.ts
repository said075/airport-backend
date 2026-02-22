/**
 * Run with: npm run scrape:mostar
 * Fetches Mostar flights from api.mostar-airport.ba and saves to MongoDB + Redis.
 */

import { connectDB, db, redisClient } from "../services/db";
import { scrapeMostarFlights } from "../scraper/mostar";

const CACHE_KEY = "flights:mostar";
const CACHE_TTL_SEC = 86400; // 24 hours

async function main() {
  await connectDB();

  const flights = await scrapeMostarFlights();
  const collection = db.collection("flights");

  await collection.deleteMany({ airport: "Mostar" });
  if (flights.length > 0) {
    await collection.insertMany(flights);
  }

  await redisClient.set(CACHE_KEY, JSON.stringify(flights), "EX", CACHE_TTL_SEC);
  console.log(`Mostar: scraped ${flights.length} flights, saved to MongoDB and Redis.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
