/**
 * Database Validation Script
 *
 * Performs integrity checks on the database:
 * - Duplicate PF numbers
 * - Missing depots
 * - Orphaned driver profiles
 * - Invalid roles
 * - Drivers without SSE/TRD managers
 *
 * Usage:
 *   node config/validateDatabase.js
 *
 * @module config/validateDatabase
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import DailyLog from "../models/DailyLog.js";
import TCardChecklist from "../models/TCardChecklist.js";

const validateDatabase = async () => {
  try {
    console.log("\n🔍 DATABASE VALIDATION REPORT");
    console.log("=".repeat(60));
    console.log(`Date: ${new Date().toISOString()}`);
    console.log("=".repeat(60) + "\n");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    let issues = 0;

    // =====================================================
    // CHECK 1: Duplicate PF Numbers
    // =====================================================
    console.log("📋 CHECK 1: Duplicate PF Numbers");
    console.log("-".repeat(40));

    const duplicates = await User.aggregate([
      { $group: { _id: "$pfNo", count: { $sum: 1 }, users: { $push: "$name" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length === 0) {
      console.log("   ✅ No duplicate PF numbers found\n");
    } else {
      console.log(`   ❌ Found ${duplicates.length} duplicate PF numbers:`);
      duplicates.forEach(d => {
        console.log(`      - PF: ${d._id} (${d.count} users: ${d.users.join(", ")})`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 2: Users Without Depot
    // =====================================================
    console.log("📋 CHECK 2: Users Without Depot (excluding SUPER_ADMIN)");
    console.log("-".repeat(40));

    const noDepot = await User.find({
      role: { $ne: "SUPER_ADMIN" },
      $or: [
        { depotName: null },
        { depotName: "" },
        { depotName: { $exists: false } }
      ]
    }).select("name pfNo role");

    if (noDepot.length === 0) {
      console.log("   ✅ All users have depot assigned\n");
    } else {
      console.log(`   ❌ Found ${noDepot.length} users without depot:`);
      noDepot.forEach(u => {
        console.log(`      - ${u.name} (PF: ${u.pfNo}, Role: ${u.role})`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 3: Invalid Roles
    // =====================================================
    console.log("📋 CHECK 3: Invalid Roles");
    console.log("-".repeat(40));

    const validRoles = ["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN"];
    const invalidRoles = await User.find({
      role: { $nin: validRoles }
    }).select("name pfNo role");

    if (invalidRoles.length === 0) {
      console.log("   ✅ All users have valid roles\n");
    } else {
      console.log(`   ❌ Found ${invalidRoles.length} users with invalid roles:`);
      invalidRoles.forEach(u => {
        console.log(`      - ${u.name} (PF: ${u.pfNo}, Role: ${u.role})`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 4: Drivers Without Profile
    // =====================================================
    console.log("📋 CHECK 4: Drivers Without Profile");
    console.log("-".repeat(40));

    const drivers = await User.find({ role: "DRIVER" }).select("_id name pfNo");
    const driverIds = drivers.map(d => d._id.toString());

    const profileDriverIds = await DriverProfile.distinct("userId");
    const profileDriverIdStrings = profileDriverIds.map(id => id.toString());

    const driversWithoutProfile = drivers.filter(
      d => !profileDriverIdStrings.includes(d._id.toString())
    );

    if (driversWithoutProfile.length === 0) {
      console.log("   ✅ All drivers have profiles\n");
    } else {
      console.log(`   ❌ Found ${driversWithoutProfile.length} drivers without profile:`);
      driversWithoutProfile.forEach(d => {
        console.log(`      - ${d.name} (PF: ${d.pfNo})`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 5: Orphaned Profiles
    // =====================================================
    console.log("📋 CHECK 5: Orphaned Driver Profiles");
    console.log("-".repeat(40));

    const orphanedProfiles = await DriverProfile.find({
      userId: { $nin: await User.distinct("_id") }
    });

    if (orphanedProfiles.length === 0) {
      console.log("   ✅ No orphaned profiles found\n");
    } else {
      console.log(`   ❌ Found ${orphanedProfiles.length} orphaned profiles:`);
      orphanedProfiles.forEach(p => {
        console.log(`      - Profile ID: ${p._id} (userId: ${p.userId})`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 6: Depots Without SSE/TRD
    // =====================================================
    console.log("📋 CHECK 6: Depots Without SSE/TRD Manager");
    console.log("-".repeat(40));

    const driverDepots = await User.distinct("depotName", {
      role: "DRIVER",
      depotName: { $ne: null }
    });

    const managerDepots = await User.distinct("depotName", {
      role: "DEPOT_MANAGER",
      depotName: { $ne: null }
    });

    const depotsWithoutManager = driverDepots.filter(
      d => !managerDepots.includes(d)
    );

    if (depotsWithoutManager.length === 0) {
      console.log("   ✅ All depots have assigned managers\n");
    } else {
      console.log(`   ⚠️  Found ${depotsWithoutManager.length} depots without SSE/TRD:`);
      depotsWithoutManager.forEach(d => {
        console.log(`      - ${d}`);
        issues++;
      });
      console.log();
    }

    // =====================================================
    // CHECK 7: Orphaned Daily Logs
    // =====================================================
    console.log("📋 CHECK 7: Orphaned Daily Logs");
    console.log("-".repeat(40));

    const orphanedLogs = await DailyLog.countDocuments({
      driverId: { $nin: await User.distinct("_id", { role: "DRIVER" }) }
    });

    if (orphanedLogs === 0) {
      console.log("   ✅ No orphaned daily logs found\n");
    } else {
      console.log(`   ❌ Found ${orphanedLogs} orphaned daily logs\n`);
      issues++;
    }

    // =====================================================
    // CHECK 8: Orphaned T-Cards
    // =====================================================
    console.log("📋 CHECK 8: Orphaned T-Card Checklists");
    console.log("-".repeat(40));

    const orphanedTCards = await TCardChecklist.countDocuments({
      driverId: { $nin: await User.distinct("_id", { role: "DRIVER" }) }
    });

    if (orphanedTCards === 0) {
      console.log("   ✅ No orphaned T-Cards found\n");
    } else {
      console.log(`   ❌ Found ${orphanedTCards} orphaned T-Cards\n`);
      issues++;
    }

    // =====================================================
    // STATISTICS
    // =====================================================
    console.log("📊 DATABASE STATISTICS");
    console.log("-".repeat(40));

    const stats = {
      superAdmins: await User.countDocuments({ role: "SUPER_ADMIN" }),
      depotManagers: await User.countDocuments({ role: "DEPOT_MANAGER" }),
      drivers: await User.countDocuments({ role: "DRIVER" }),
      profiles: await DriverProfile.countDocuments(),
      dailyLogs: await DailyLog.countDocuments(),
      tCards: await TCardChecklist.countDocuments(),
      depots: (await User.distinct("depotName", { depotName: { $ne: null } })).length
    };

    console.log(`   Super Admins (Sr.DEE/TRD/SA): ${stats.superAdmins}`);
    console.log(`   Depot Managers (SSE/TRD):     ${stats.depotManagers}`);
    console.log(`   Drivers (TWD):                ${stats.drivers}`);
    console.log(`   Driver Profiles:              ${stats.profiles}`);
    console.log(`   Daily Logs:                   ${stats.dailyLogs}`);
    console.log(`   T-Card Checklists:            ${stats.tCards}`);
    console.log(`   Unique Depots:                ${stats.depots}`);

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log("\n" + "=".repeat(60));
    console.log("📋 VALIDATION SUMMARY");
    console.log("=".repeat(60));

    if (issues === 0) {
      console.log("   ✅ DATABASE INTEGRITY: PASSED");
      console.log("   All checks completed successfully.");
    } else {
      console.log(`   ⚠️  DATABASE INTEGRITY: ${issues} ISSUE(S) FOUND`);
      console.log("   Please review and fix the issues above.");
    }

    console.log("=".repeat(60) + "\n");

    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB\n");

    process.exit(issues > 0 ? 1 : 0);

  } catch (err) {
    console.error("\n❌ Validation Error:", err.message);
    process.exit(1);
  }
};

// Run validation
validateDatabase();

