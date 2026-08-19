/**
 * Database Configuration Module
 *
 * This module handles MongoDB connection with environment-based switching:
 * - Production: MongoDB Atlas (MONGO_URI from .env)
 * - Development: Local MongoDB (MONGO_URI from .env.development)
 *
 * Environment detection is based on NODE_ENV variable.
 *
 * @module config/db
 */

import mongoose from "mongoose";

/**
 * Connect to MongoDB based on environment
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const nodeEnv = process.env.NODE_ENV || "production";
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  // Log connection mode (masking sensitive URI parts)
  const isLocal = mongoUri.includes("localhost") || mongoUri.includes("127.0.0.1");
  const connectionMode = isLocal ? "LOCAL" : "ATLAS";

  console.log(`\n🔧 Environment: ${nodeEnv.toUpperCase()}`);
  console.log(`📦 Database Mode: ${connectionMode}`);

  if (nodeEnv === "development") {
    console.log("⚠️  Running in DEVELOPMENT mode with LOCAL database");
    console.log("⚠️  This is a TEMPORARY configuration");
  }

  try {
    await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected (${connectionMode})`);
    console.log(`📍 Database: ${mongoose.connection.name || "default"}\n`);

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);

    if (!isLocal) {
      console.log("\n💡 Hint: If Atlas is inaccessible, switch to local development:");
      console.log("   1. Start local MongoDB: mongod");
      console.log("   2. Run with: NODE_ENV=development npm run dev");
    }

    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("📤 MongoDB Disconnected");
  } catch (err) {
    console.error("❌ Error disconnecting from MongoDB:", err.message);
  }
};

export default { connectDB, disconnectDB };

