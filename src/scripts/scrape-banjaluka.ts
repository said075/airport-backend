/**
 * Run with: npm run scrape:banjaluka
 * Scrapes Banja Luka (BNX) flights from WordPress API and saves to MongoDB + Redis.
 */

import { connectDB, db, redisClient } from "../services/db";
import { scrapeBanjaLukaFlights } from "../scraper/banjaluka";

const CACHE_KEY = "flights:banjaluka";
const CACHE_TTL_SEC = 86400; // 24 hours

async function main() {
  await connectDB();

  const flights = await scrapeBanjaLukaFlights();
  const collection = db.collection("flights");

  await collection.deleteMany({ airport: "Banja Luka" });
  if (flights.length > 0) {
    await collection.insertMany(flights);
  }

  await redisClient.set(CACHE_KEY, JSON.stringify(flights), "EX", CACHE_TTL_SEC);
  console.log(`Banja Luka: scraped ${flights.length} flights, saved to MongoDB and Redis.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
