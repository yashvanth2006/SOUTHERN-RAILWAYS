/**
 * Database Seeder Script
 *
 * This script populates the LOCAL development database with initial test data.
 * It creates:
 * - 1 Super Admin
 * - 1 Depot Manager
 * - Sample Drivers (from all_data_out.md)
 *
 * IMPORTANT: This script is for DEVELOPMENT purposes only.
 * DO NOT run this against production database.
 *
 * Usage:
 *   NODE_ENV=development node config/seeder.js
 *
 * @module config/seeder
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load development environment - clear existing MONGO_URI first to ensure override
if (process.env.NODE_ENV === "development") {
  delete process.env.MONGO_URI;
}
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
dotenv.config({ path: envFile, override: true });

// Import models
import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import Circular from "../models/Circular.js";

// Sample data based on all_data_out.md
const sampleUsers = [
  // Super Admin
  {
    name: "System Administrator",
    pfNo: "ADMIN001",
    role: "SUPER_ADMIN",
    depotName: "HEADQUARTERS"
  },
  // Depot Manager
  {
    name: "Depot Manager BQI",
    pfNo: "MANAGER001",
    role: "DEPOT_MANAGER",
    depotName: "BOMMIDI"
  },
  // Drivers from all_data_out.md
  {
    name: "S.RAMAN",
    pfNo: "15661204985",
    role: "DRIVER",
    depotName: "BOMMIDI",
    profile: {
      hrmsId: "15661204985",
      designation: "TWD/BQI (Tech-II/OHE/BQI)",
      basicPay: 25500,
      dateOfAppointment: new Date("2012-04-18"),
      dateOfEntryAsTWD: new Date("2021-03-05"),
      trainings: {
        PME: { doneDate: new Date("2025-02-20"), dueDate: new Date("2029-02-19"), schedule: "4 years" },
        GRS_RC: { doneDate: new Date("2024-03-30"), dueDate: new Date("2027-03-29"), schedule: "3 years" },
        TR4: { doneDate: new Date("2024-05-10"), dueDate: new Date("2027-05-09"), schedule: "3 years" },
        OC: { doneDate: new Date("2025-08-30"), dueDate: new Date("2026-02-28"), schedule: "6 months" }
      },
      lrDetails: [
        { section: "BQI-JTJ-BQI", doneDate: new Date("2025-12-16"), dueDate: new Date("2026-03-15"), schedule: "3 months" },
        { section: "BQI-ED-BQI", doneDate: new Date("2026-01-03"), dueDate: new Date("2026-04-02"), schedule: "3 months" }
      ]
    }
  },
  {
    name: "Swaroop Joseph",
    pfNo: "15661506576",
    role: "DRIVER",
    depotName: "CHINNA SALEM",
    profile: {
      hrmsId: "15661506576",
      designation: "TWD/CHSM(Tech-I/OHE/CHSM)",
      basicPay: 31900,
      dateOfAppointment: new Date("2015-12-03"),
      dateOfEntryAsTWD: new Date("2022-12-30"),
      trainings: {
        PME: { doneDate: new Date("2022-06-28"), dueDate: new Date("2026-06-27"), schedule: "4 years" },
        GRS_RC: { doneDate: new Date("2025-09-30"), dueDate: new Date("2028-09-29"), schedule: "3 years" },
        TR4: { doneDate: new Date("2025-12-17"), dueDate: new Date("2028-12-16"), schedule: "3 years" },
        OC: { doneDate: new Date("2025-12-21"), dueDate: new Date("2026-06-20"), schedule: "6 months" }
      },
      lrDetails: [
        { section: "ED-CBE-ED", doneDate: new Date("2025-10-18"), dueDate: new Date("2026-01-17"), schedule: "3 months" },
        { section: "ED-SA-ED", doneDate: new Date("2025-10-18"), dueDate: new Date("2026-01-17"), schedule: "3 months" }
      ]
    }
  },
  {
    name: "GOBINATH P",
    pfNo: "15661403040",
    role: "DRIVER",
    depotName: "KARUR",
    profile: {
      hrmsId: "15661403040",
      designation: "TWD/KRR (Tech-I/OHE/KRR)",
      basicPay: 32900,
      dateOfAppointment: new Date("2014-07-11"),
      dateOfEntryAsTWD: new Date("2021-05-24"),
      trainings: {
        PME: { doneDate: new Date("2025-02-22"), dueDate: new Date("2029-02-21"), schedule: "4 years" },
        GRS_RC: { doneDate: new Date("2024-03-30"), dueDate: new Date("2027-03-29"), schedule: "3 years" },
        TR4: { doneDate: new Date("2024-04-16"), dueDate: new Date("2027-04-15"), schedule: "3 years" },
        OC: { doneDate: new Date("2025-12-25"), dueDate: new Date("2026-06-24"), schedule: "6 months" }
      },
      lrDetails: [
        { section: "KRR-DG", doneDate: new Date("2025-12-11"), dueDate: new Date("2026-03-10"), schedule: "3 months" },
        { section: "KRR-ED", doneDate: new Date("2025-12-19"), dueDate: new Date("2026-03-18"), schedule: "3 months" }
      ]
    }
  },
  {
    name: "Durgadas K",
    pfNo: "15629802390",
    role: "DRIVER",
    depotName: "PODANUR",
    profile: {
      hrmsId: "15629802390",
      designation: "TWD/PTJ (Tech-I/OHE/PTJ)",
      basicPay: 32900,
      dateOfAppointment: new Date("2018-02-28"),
      dateOfEntryAsTWD: new Date("2022-01-27"),
      trainings: {
        PME: { doneDate: new Date("2023-04-04"), dueDate: new Date("2027-04-03"), schedule: "4 years" },
        GRS_RC: { doneDate: new Date("2024-11-30"), dueDate: new Date("2027-11-29"), schedule: "3 years" },
        TR4: { doneDate: new Date("2025-01-22"), dueDate: new Date("2028-01-21"), schedule: "3 years" },
        OC: { doneDate: new Date("2025-11-29"), dueDate: new Date("2026-05-28"), schedule: "6 months" }
      },
      lrDetails: [
        { section: "CBE-ED", doneDate: new Date("2025-10-08"), dueDate: new Date("2026-01-07"), schedule: "3 months" },
        { section: "ED-SA", doneDate: new Date("2025-09-29"), dueDate: new Date("2025-12-28"), schedule: "3 months" }
      ]
    }
  }
];

const seedDatabase = async () => {
  try {
    console.log("\n🌱 Starting Database Seeder...\n");

    // Safety check - only run on local database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri.includes("localhost") && !mongoUri.includes("127.0.0.1")) {
      console.error("❌ ERROR: This seeder can only run against LOCAL database!");
      console.error("   Set NODE_ENV=development and use local MongoDB URI.");
      process.exit(1);
    }

    // Connect to database
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to local MongoDB\n");

    // Clear existing data (for fresh seed)
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await DriverProfile.deleteMany({});
    await Circular.deleteMany({});
    console.log("   Users cleared");
    console.log("   Driver profiles cleared");
    console.log("   Circulars cleared\n");

    // Seed users
    console.log("📝 Creating users...");

    let adminUserId = null;

    for (const userData of sampleUsers) {
      // Password is same as PF Number (initial password rule)
      const hashedPassword = await bcrypt.hash(userData.pfNo, 10);

      const user = await User.create({
        name: userData.name,
        pfNo: userData.pfNo,
        password: hashedPassword,
        role: userData.role,
        depotName: userData.depotName
      });

      // Track admin ID for circular seeding
      if (userData.role === "SUPER_ADMIN") {
        adminUserId = user._id;
      }

      console.log(`   ✅ ${userData.role}: ${userData.name} (PF: ${userData.pfNo})`);

      // Create driver profile if user is a driver
      if (userData.role === "DRIVER" && userData.profile) {
        await DriverProfile.create({
          userId: user._id,
          ...userData.profile
        });
        console.log(`      └── Profile created`);
      }
    }

    // Seed a test circular
    console.log("\n📋 Creating test circular...");
    if (adminUserId) {
      await Circular.create({
        title: "Safety Guidelines - January 2026",
        pdfUrl: "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        postedBy: adminUserId
      });
      console.log("   ✅ Test circular created");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDING COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Test Credentials (password = PF Number):\n");
    console.log("   Super Admin:    ADMIN001 / ADMIN001");
    console.log("   Depot Manager:  MANAGER001 / MANAGER001");
    console.log("   Driver 1:       15661204985 / 15661204985");
    console.log("   Driver 2:       15661506576 / 15661506576");
    console.log("   Driver 3:       15661403040 / 15661403040");
    console.log("   Driver 4:       15629802390 / 15629802390");
    console.log("\n⚠️  Note: A test circular has been created.");
    console.log("   Users will see the circular popup on login.\n");

    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB\n");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeder Error:", err.message);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
