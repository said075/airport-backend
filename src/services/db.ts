import { MongoClient } from "mongodb";
import Redis from "ioredis";

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const redisUri = process.env.REDIS_URI || "redis://localhost:6379";

export const mongoClient = new MongoClient(mongoUri);
export const db = mongoClient.db("bih_flights");

export const redisClient = new Redis(redisUri, { lazyConnect: true });

export async function connectDB() {
  await mongoClient.connect();
  console.log("MongoDB connected");
  await redisClient.connect();
  console.log("Redis connected");
}