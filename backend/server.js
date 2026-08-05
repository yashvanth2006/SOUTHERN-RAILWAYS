import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import engineRoutes from "./routes/engineRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import depotRoutes from "./routes/depotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import abnormalityRoutes from "./routes/abnormalityRoutes.js";
import circularRoutes from "./routes/adminCircularRoutes.js";
import { connectDB } from "./config/db.js";


/**
 * Environment Configuration
 *
 * Loads environment variables based on NODE_ENV:
 * - development: loads .env.development (local MongoDB)
 * - production/default: loads .env (MongoDB Atlas)
 *
 * To switch to local development:
 *   NODE_ENV=development npm run dev:local
 *
 * To restore production (Atlas):
 *   npm run dev (or NODE_ENV=production npm run dev)
 */
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";

// Clear existing env vars for MONGO_URI if in development to ensure .env.development takes precedence
if (process.env.NODE_ENV === "development") {
  delete process.env.MONGO_URI;
}

dotenv.config({ path: envFile, override: true });

// Log which config is loaded


const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using environment-based configuration
connectDB();

app.get("/", (req, res) => {
  res.send("Railway Backend Running");
});

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/driver", driverRoutes);
app.use("/depot", depotRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", circularRoutes);
app.use("/engine", engineRoutes);
app.use("/abnormalities", abnormalityRoutes);
app.use("/issues", issueRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
  console.log(`Server running on port ${PORT}`);
});

