/**
 * Run with: npm run scrape:tuzla
 * Scrapes Tuzla airport flights and saves them to MongoDB (and updates Redis cache).
 */

import { connectDB, db, redisClient } from "../services/db";
import { scrapeTuzlaFlights } from "../scraper/tuzla";

const CACHE_KEY = "flights:tuzla";
const CACHE_TTL_SEC = 86400; // 24 hours

async function main() {
  await connectDB();

  const flights = await scrapeTuzlaFlights();
  const collection = db.collection("flights");

  await collection.deleteMany({ airport: "Tuzla" });
  if (flights.length > 0) {
    await collection.insertMany(flights);
  }

  await redisClient.set(CACHE_KEY, JSON.stringify(flights), "EX", CACHE_TTL_SEC);
  console.log(`Tuzla: scraped ${flights.length} flights, saved to MongoDB and Redis.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
