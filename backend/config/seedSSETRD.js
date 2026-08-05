/**
 * SSE/TRD User Seeder Script
 *
 * This script creates SSE/TRD (Depot Manager) accounts based on client-provided data.
 *
 * IMPORTANT:
 * - Run this ONLY after extracting SSE/TRD data from client document
 * - Review and update the sseData array below with actual values
 * - Run against production database with caution
 *
 * Usage:
 *   node config/seedSSETRD.js
 *
 * @module config/seedSSETRD
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";

/**
 * SSE/TRD User Data from Client Document
 *
 * Source: Client requirements document (client_changes.md)
 * Updated: January 28, 2026
 *
 * Format:
 * {
 *   name: "Full Name",
 *   pfNo: "PF Number",
 *   depotName: "DEPOT NAME",
 *   phone: "Phone Number"
 * }
 */
const sseData = [
  // =====================================================
  // SSE/TRD DATA FROM CLIENT DOCUMENT
  // =====================================================

  {
    name: "G.VENKATACHALAM",
    pfNo: "15605702938",
    depotName: "SLY",
    phone: "7904498245"
  },
  {
    name: "M.SIVAPRAKASAM",
    pfNo: "15605704315",
    depotName: "BQI",
    phone: "9003956336"
  },
  {
    name: "A.RAMACHANDRAN",
    pfNo: "15605608612",
    depotName: "MTDM",
    phone: "9003956335"
  },
  {
    name: "J.ALLWIN SANTHAKUMAR",
    pfNo: "15213MAS452",
    depotName: "SA",
    phone: "7904495532"
  },
  {
    name: "RAJESH.T.S",
    pfNo: "15601995327",
    depotName: "ED",
    phone: "9003956331"
  },
  {
    name: "VISHNUDEEPAN.N",
    pfNo: "15661101539",
    depotName: "TUP",
    phone: "9003956338"
  },
  {
    name: "AJEESH CHACKO",
    pfNo: "15607MAS595",
    depotName: "PTJ",
    phone: "9003956334"
  },
  {
    name: "PERIASAMY.K",
    pfNo: "15604769302",
    depotName: "KMD",
    phone: "9003956360"
  },
  {
    name: "EMERALD PRATHIBAN.A",
    pfNo: "15604040253",
    depotName: "KRR",
    phone: "9003956337"
  },
  {
    name: "KARTHIKEYAN.M",
    pfNo: "15605MAS424",
    depotName: "PLI",
    phone: "9003956344"
  },
  {
    name: "K.CHANDRAN",
    pfNo: "15660802248",
    depotName: "NMKL",
    phone: "9003956333"
  },
  {
    name: "K.SURESH",
    pfNo: "15212MS1027",
    depotName: "CHSM",
    phone: "7904485369"
  }
];

/**
 * Driver-to-Depot Assignments
 *
 * Map existing drivers to their correct depots based on client data
 * Source: Client requirements document (client_changes.md)
 * Format: { "DriverName": "DEPOT_NAME" }
 *
 * Note: Using driver names as keys since PF numbers are not provided in client doc
 * This will be used to find and update driver records by name match
 */
const driverDepotAssignments = {
  // =====================================================
  // DRIVER ASSIGNMENTS FROM CLIENT DOCUMENT
  // =====================================================

  // SSE/TRD/SLY - G.VENKATACHALAM
  "MAHALINGAM": "SLY",

  // SSE/TRD/BQI - M.SIVAPRAKASAM
  "A.RAMAN": "BQI",

  // SSE/TRD/MTDM - A.RAMACHANDRAN (No TWD assigned)

  // SSE/TRD/SA - J.ALLWIN SANTHAKUMAR
  "B.NIZAMUDEEN": "SA",
  "MANIKANDAN": "SA",

  // SSE/TRD/ED - RAJESH.T.S
  "AJAY KUMAR": "ED",
  "NANDAKUMAR": "ED",

  // SSE/TRD/TUP - VISHNUDEEPAN.N
  "VIJAY KUMAR ANGADI": "TUP",

  // SSE/TRD/PTJ - AJEESH CHACKO
  "K.DURGADAS": "PTJ",

  // SSE/TRD/KMD - PERIASAMY.K (No TWD assigned)

  // SSE/TRD/KRR - EMERALD PRATHIBAN.A
  "B.GOPINATH": "KRR",

  // SSE/TRD/PLI - KARTHIKEYAN.M
  "VINOD VARATHARAJAN": "PLI",

  // SSE/TRD/NMKL - K.CHANDRAN
  "GAJENDRA SINGH MEENA": "NMKL",

  // SSE/TRD/CHSM - K.SURESH
  "SWAROOP.P": "CHSM"
};

const seedSSETRD = async () => {
  try {
    console.log("\n🌱 SSE/TRD User Seeder\n");
    console.log("=".repeat(60));

    // Validate data exists
    if (sseData.length === 0) {
      console.log("\n⚠️  WARNING: No SSE/TRD data configured!");
      console.log("   Please update sseData array with client-provided data.");
      console.log("   Exiting without changes.\n");
      process.exit(0);
    }

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("📝 Creating SSE/TRD Users...\n");

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const sse of sseData) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ pfNo: sse.pfNo });

        if (existing) {
          console.log(`   ⏭️  SKIP: ${sse.name} (PF: ${sse.pfNo}) - Already exists`);
          skipped++;
          continue;
        }

        // Password = PF Number (hashed)
        const hashedPassword = await bcrypt.hash(sse.pfNo, 10);

        await User.create({
          name: sse.name,
          pfNo: sse.pfNo,
          password: hashedPassword,
          role: "DEPOT_MANAGER",
          depotName: sse.depotName,
          passwordChanged: false // Forces password change on first login
        });

        console.log(`   ✅ CREATED: ${sse.name}`);
        console.log(`      └── PF: ${sse.pfNo} | Depot: ${sse.depotName}`);
        created++;

      } catch (err) {
        console.log(`   ❌ ERROR: ${sse.name} - ${err.message}`);
        errors++;
      }
    }

    // Update driver depot assignments if any
    if (Object.keys(driverDepotAssignments).length > 0) {
      console.log("\n📝 Updating Driver Depot Assignments...\n");

      let updated = 0;
      let notFound = 0;

      for (const [driverName, depotName] of Object.entries(driverDepotAssignments)) {
        // Search by name using case-insensitive regex
        const result = await User.findOneAndUpdate(
          {
            name: { $regex: new RegExp(driverName, 'i') },
            role: "DRIVER"
          },
          { depotName },
          { new: true }
        );

        if (result) {
          console.log(`   ✅ UPDATED: ${result.name} (PF: ${result.pfNo}) → ${depotName}`);
          updated++;
        } else {
          console.log(`   ⚠️  NOT FOUND: Driver named "${driverName}"`);
          notFound++;
        }
      }

      console.log(`\n   Drivers updated: ${updated}`);
      console.log(`   Drivers not found: ${notFound}`);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`   SSE/TRD Created:  ${created}`);
    console.log(`   SSE/TRD Skipped:  ${skipped}`);
    console.log(`   SSE/TRD Errors:   ${errors}`);
    console.log("=".repeat(60));

    if (created > 0) {
      console.log("\n🔑 Login Credentials:");
      console.log("   Username: PF Number");
      console.log("   Password: PF Number (must change on first login)");
    }

    await mongoose.disconnect();
    console.log("\n📤 Disconnected from MongoDB\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Seeder Error:", err.message);
    process.exit(1);
  }
};

// Run seeder
seedSSETRD();

