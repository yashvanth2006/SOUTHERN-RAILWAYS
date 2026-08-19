import crypto from "crypto";
import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";
import Circular from "../models/Circular.js";
import Depot from "../models/Depot.js";
import { generateCSV } from "../utils/reportExporter.js";
import { isUserInScope, isDepotInScope, depotFilterFor, userFilterFor } from "../services/authorization/scopeService.js";

import bcrypt from 'bcryptjs';
import DriverProfile from "../models/DriverProfile.js";
import District from "../models/District.js";
import { DISTRICT_NAMES, getDistrictForDepot } from "../config/districtDepots.js";
import {
  normalizeDepotName,
  resolveUserDistrictName
} from "../utils/accessScope.js";

/* ======================================================
   REGISTER USER (SUPER ADMIN ONLY)
====================================================== */
export const getOverdueRecords = async (req, res) => {
  try {

    const today = new Date();
    const { depot } = req.query;

    const filter = {
      role: "DRIVER",
      status: "ACTIVE",
      ...depotFilterFor(req.scope)
    };

    if (depot) {
      const normalizedDepot = normalizeDepotName(depot);
      const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });

      if (!reqDepotDoc) {
        return res.status(400).json({ msg: "Invalid depot" });
      }

      const inScope = req.scope.depotIds === "ALL" || (req.scope.depotIds || []).some(id => id.toString() === reqDepotDoc._id.toString());
      if (!inScope) {
        return res.status(403).json({ msg: "Selected depot is outside your scope" });
      }

      filter.depotId = reqDepotDoc._id;
    }

    const users = await User.find(filter)
      .select("name pfNo depotName lastAcknowledgedCircularId");
    const overdueRecords = [];
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id");

    let pendingCircularCount = 0;

    if (latestCircular) {
      for (const user of users) {
        const acknowledged =
          user.lastAcknowledgedCircularId &&
          user.lastAcknowledgedCircularId.toString() ===
          latestCircular._id.toString();

        if (!acknowledged) {
          pendingCircularCount++;
        }
      }
    }
    for (const user of users) {

      const profile = await DriverProfile.findOne({
        userId: user._id
      });

      if (!profile) continue;

      /* ===========================
         HEALTH / TRAINING
      =========================== */

      if (profile.trainings) {

        for (const [trainingName, training] of Object.entries(profile.trainings)) {

          if (!training?.dueDate) continue;

          const dueDate = new Date(training.dueDate);

          if (dueDate < today) {

            const overdueDays = Math.floor(
              (today - dueDate) / (1000 * 60 * 60 * 24)
            );

            overdueRecords.push({

              driverId: user._id,

              driverName: user.name,

              pfNo: user.pfNo,

              depotName: user.depotName,

              category: "Training Overdue",

              item: trainingName.replace("_", "/"),

              dueDate,

              overdueDays

            });

          }
        }
      }

      /* ===========================
         LR DETAILS
      =========================== */

      if (profile.lrDetails?.length) {

        for (const lr of profile.lrDetails) {

          if (!lr?.dueDate) continue;

          const dueDate = new Date(lr.dueDate);

          if (dueDate < today) {

            const overdueDays = Math.floor(
              (today - dueDate) / (1000 * 60 * 60 * 24)
            );

            overdueRecords.push({

              driverId: user._id,

              driverName: user.name,

              pfNo: user.pfNo,

              depotName: user.depotName,

              category: "LR Overdue",

              item: lr.section,

              dueDate,

              overdueDays

            });

          }

        }

      }

    }

    overdueRecords.sort(
      (a, b) => b.overdueDays - a.overdueDays
    );

    res.json(overdueRecords);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to load overdue records"
    });

  }
};

export const adminRegisterUser = async (req, res) => {
  try {
    const { name, pfNo, role, depotName, assignedDepots } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!name || !pfNo || !role) {
      return res.status(400).json({
        msg: "All fields are required"
      });
    }

    // 🔥 Allow ADEE and SUPER_ADMIN also
    if (!["DRIVER", "DEPOT_MANAGER", "ADEE", "SUPER_ADMIN"].includes(role)) {
      return res.status(400).json({
        msg: "Invalid role selection"
      });
    }

    // 🔥 Depot required for DRIVER, DEPOT_MANAGER, SUPER_ADMIN, and ADEE
    if (["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN", "ADEE"].includes(role) && !depotName) {
      return res.status(400).json({
        msg: "Depot is required"
      });
    }

    // 🔥 ADEE must have assigned depots
    if (role === "ADEE") {
      if (!assignedDepots || assignedDepots.length === 0) {
        return res.status(400).json({
          msg: "Assigned depots required for ADEE"
        });
      }
    }

    /* ---------- CHECK EXISTING ---------- */
    const exists = await User.findOne({ pfNo });
    if (exists) {
      return res.status(400).json({
        msg: "User with this PF No already exists"
      });
    }

    /* ---------- PASSWORD = PF NO ---------- */
    const hashedPassword = await bcrypt.hash(pfNo, 10);

    /* ---------- CREATE USER ---------- */
    const user = await User.create({
      name,
      pfNo,
      password: hashedPassword,
      role,
      depotName: depotName,
      assignedDepots: role === "ADEE" ? assignedDepots : [],
      passwordChanged: false
    });

    /* ---------- CREATE EMPTY DRIVER PROFILE ---------- */
    if (role === "DRIVER") {
      await DriverProfile.create({
        userId: user._id,
        hrmsId: pfNo
      });
    }

    res.status(201).json({
      msg: `${role} registered successfully`
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const adminRegisterUserV2 = async (req, res) => {
  try {
    const { name, pfNo, role, depotName, assignedDepots, districtName } = req.body;

    if (!name || !pfNo || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["DRIVER", "DEPOT_MANAGER", "ADEE", "SUPER_ADMIN"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role selection" });
    }

    // --- preserved rule: Only Master Admin can create Super Admin accounts ---
    if (role === "SUPER_ADMIN" && req.scope.role !== "SUPER_ADMIN") {
      return res.status(403).json({ msg: "Only Master Admin can create Super Admin accounts" });
    }

    // --- preserved rule: Master Admin can create only Super Admin accounts ---
    if (role !== "SUPER_ADMIN" && req.scope.role === "SUPER_ADMIN") {
      return res.status(403).json({ msg: "Master Admin can create only Super Admin accounts" });
    }

    if (["DRIVER", "DEPOT_MANAGER", "ADEE"].includes(role) && !depotName) {
      return res.status(400).json({ msg: "Depot is required" });
    }

    const normalizedAssignedDepots = (assignedDepots || []).map(normalizeDepotName).filter(Boolean);

    if (role === "ADEE" && normalizedAssignedDepots.length === 0) {
      return res.status(400).json({ msg: "Assigned depots required for ADEE" });
    }

    let userDistrictName = null;
    let userDepotName = normalizeDepotName(depotName);
    let userDistrictId = null;
    let userDepotId = null;
    let userAssignedDepotIds = [];

    if (role === "SUPER_ADMIN") {
      userDistrictName = districtName || depotName;

      if (!DISTRICT_NAMES.includes(userDistrictName)) {
        return res.status(400).json({ msg: "Valid district is required for Super Admin" });
      }

      const existingDistrictAdmin = await User.findOne({ role: "SUPER_ADMIN", districtName: userDistrictName });
      const legacyDistrictAdmin = await User.findOne({ role: "SUPER_ADMIN", depotName: userDistrictName });
      const anySuperAdminForDistrict = (await User.find({ role: "SUPER_ADMIN" })).some(superAdmin => resolveUserDistrictName(superAdmin) === userDistrictName);

      if (existingDistrictAdmin || legacyDistrictAdmin || anySuperAdminForDistrict) {
        return res.status(400).json({ msg: "A Super Admin is already registered for this district" });
      }

      const districtDoc = await District.findOneAndUpdate(
        { name: userDistrictName },
        { $setOnInsert: { name: userDistrictName } },
        { upsert: true, new: true }
      );
      userDistrictId = districtDoc._id;
      userDepotName = null;
    } else {
      // Find the specific depot they want to assign to
      const depotDoc = await Depot.findOne({ name: userDepotName, status: "ACTIVE" });
      console.log("DEBUG: Admin Registration attempt:", { userDepotName, depotDocFound: !!depotDoc });
      if (!depotDoc) return res.status(400).json({ msg: "Invalid or inactive depot" });

      userDistrictName = depotDoc.districtName || getDistrictForDepot(depotDoc.name);
      userDistrictId = depotDoc.districtId;

      if (["DRIVER", "DEPOT_MANAGER", "ADEE"].includes(role) && !isDepotInScope(req.scope, depotDoc._id)) {
        return res.status(403).json({ msg: "Selected depot is outside your scope" });
      }
      userDepotId = depotDoc._id;

      if (role === "ADEE") {
        const assignedDocs = await Depot.find({ name: { $in: normalizedAssignedDepots }, status: "ACTIVE" });
        for (const d of assignedDocs) {
          if (!isDepotInScope(req.scope, d._id)) {
            return res.status(403).json({ msg: "Assigned depots must belong to your scope" });
          }
          userAssignedDepotIds.push(d._id);
        }
      }
    }

    const exists = await User.findOne({ pfNo });
    if (exists) {
      return res.status(400).json({ msg: "User with this PF No already exists" });
    }

    const hashedPassword = await bcrypt.hash(pfNo, 10);

    const user = await User.create({
      name,
      pfNo,
      password: hashedPassword,
      role,
      districtName: userDistrictName,
      districtId: userDistrictId,
      depotName: role === "SUPER_ADMIN" ? null : userDepotName,
      depotId: userDepotId,
      assignedDepots: role === "ADEE" ? normalizedAssignedDepots : [],
      assignedDepotIds: userAssignedDepotIds,
      createdBy: req.scope.userId,
      passwordChanged: false,
      status: "ACTIVE"
    });

    if (role === "DRIVER") {
      await DriverProfile.create({ userId: user._id, hrmsId: pfNo });
    }

    res.status(201).json({ msg: `${role} registered successfully` });
  } catch (err) {
    console.error("adminRegisterUserV2 error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* ======================================================
   DOWNLOAD REPORT (ADEE RESTRICTED)
====================================================== */

export const downloadAdminReport = async (req, res) => {
  const { from, to, depot, driverId } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const driverFilter = {
    role: "DRIVER",
    status: "ACTIVE",
    ...depotFilterFor(req.scope)
  };

  if (depot) {
    const normalizedDepot = normalizeDepotName(depot);
    const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
    if (!reqDepotDoc) return res.status(400).json({ msg: "Invalid depot" });

    const inScope = req.scope.depotIds === "ALL" || (req.scope.depotIds || []).some(id => id.toString() === reqDepotDoc._id.toString());
    if (!inScope) return res.status(403).json({ msg: "Selected depot is outside your scope" });

    driverFilter.depotId = reqDepotDoc._id;
  }

  if (driverId) {
    driverFilter._id = driverId;
  }

  const drivers = await User.find(driverFilter);

  const rows = [];

  for (const d of drivers) {
    const logs = await DailyLog.find({
      driverId: d._id,
      logDate: { $gte: start, $lte: end }
    });

    logs.forEach(l => {
      rows.push({
        Driver: d.name,
        PFNo: d.pfNo,
        Depot: d.depotName,
        Date: l.logDate.toISOString().substring(0, 10),
        Hours: l.hours,
        KM: l.km
      });
    });
  }

  const csv = generateCSV(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=admin_report.csv");
  res.send(csv);
};

/* ======================================================
   GET USERS (ADEE RESTRICTED)
====================================================== */

export const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, depot } = req.query;

    // userFilterFor properly checks both depotId and assignedDepotIds
    const filter = { ...userFilterFor(req.scope), status: "ACTIVE" };

    // If a specific depot filter is requested from the dashboard
    if (depot) {
      const normalizedDepot = normalizeDepotName(depot);
      const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
      if (reqDepotDoc) {
        // Security check: ensure the requested depot is within scope
        const inScope = req.scope.depotIds === "ALL" || (req.scope.depotIds || []).some(id => id.toString() === reqDepotDoc._id.toString());
        if (inScope) filter.depotId = reqDepotDoc._id;
      }
    }

    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { pfNo: new RegExp(search, "i") }];

    const users = await User.find(filter)
      .select("-password")
      .lean(); // Fetch all matching to group them properly for the dashboard

    const managers = users.filter(u => u.role === "DEPOT_MANAGER" || u.role === "MANAGER");
    const drivers = users.filter(u => u.role === "DRIVER");
    const mini = users.filter(u => u.role === "ADEE");

    res.json({ users, managers, drivers, mini, page: Number(page) });
  } catch (err) {
    console.error("getAdminUsers error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* ======================================================
   GET REPORT (ADEE RESTRICTED)
====================================================== */

export const getAdminReport = async (req, res) => {
  const { from, to, depot } = req.query;

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const driverFilter = {
    role: "DRIVER",
    status: "ACTIVE",
    ...depotFilterFor(req.scope)
  };

  if (depot) {
    const normalizedDepot = normalizeDepotName(depot);
    const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
    if (!reqDepotDoc) return res.status(400).json({ msg: "Invalid depot" });

    const inScope = req.scope.depotIds === "ALL" || (req.scope.depotIds || []).some(id => id.toString() === reqDepotDoc._id.toString());
    if (!inScope) return res.status(403).json({ msg: "Selected depot is outside your scope" });

    driverFilter.depotId = reqDepotDoc._id;
  }

  const drivers = await User.find(driverFilter);

  const report = [];

  for (const d of drivers) {
    const logs = await DailyLog.find({
      driverId: d._id,
      logDate: { $gte: start, $lte: end }
    });

    report.push({
      driverName: d.name,
      depot: d.depotName,
      totalKm: logs.reduce((s, l) => s + (l.km || 0), 0),
      totalHours: logs.reduce((s, l) => s + (l.hours || 0), 0),
      logs
    });
  }

  res.json({ from, to, report });
};

/* ======================================================
   DISTINCT DEPOTS (ADEE LIMITED)
====================================================== */

export const getDistinctDepots = async (req, res) => {
  try {
    if (req.scope.depotIds === "ALL") {
      const all = await Depot.find({ status: "ACTIVE" }).select("name").sort({ name: 1 });
      return res.json(all.map(d => d.name));
    }
    const allowedDepotsDocs = await Depot.find({ _id: { $in: req.scope.depotIds } }).select("name").sort({ name: 1 });
    res.json(allowedDepotsDocs.map(d => d.name));

  } catch (err) {
    res.status(500).json({ msg: "Failed to load depots" });
  }
};

/**
 * Get detailed user information for Admin view
 * Supports both DRIVER and DEPOT_MANAGER roles
 */
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch basic user info
    const user = await User.findById(userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const inScope = await isUserInScope(req.scope, user._id);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied to this user" });
    }

    let response = {
      ...user,
      profile: null,
      logs: [],
      tcards: [],
      circularStatus: {
        acknowledged: false,
        lastAcknowledgedCircularId: user.lastAcknowledgedCircularId
      }
    };

    // Check circular acknowledgement status
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id title")
      .lean();

    if (latestCircular) {
      response.circularStatus.latestCircularId = latestCircular._id;
      response.circularStatus.latestCircularTitle = latestCircular.title;
      response.circularStatus.acknowledged = !!(user.lastAcknowledgedCircularId &&
        user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString());
    } else {
      response.circularStatus.acknowledged = true;
      response.circularStatus.reason = "NO_CIRCULARS";
    }

    // For drivers, fetch additional profile and logs
    if (user.role === "DRIVER") {

      const profile = await DriverProfile.findOne({ userId }).lean();

      const logs = await DailyLog.find({ driverId: userId })
        .sort({ logDate: -1 })
        .limit(30)
        .lean();

      // ===========================
      // T-CARDS
      // ===========================

      const TCardChecklist = (
        await import("../models/TCardChecklist.js")
      ).default;

      const tcards = await TCardChecklist.find({
        driverId: userId
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      response.profile = profile;
      response.logs = logs;
      response.tcards = tcards;

      // ===========================
      // TOTAL DUTY LOGS
      // ===========================

      const totalLogs = await DailyLog.countDocuments({
        driverId: userId
      });

      // ===========================
      // TOTAL KM
      // ===========================

      const totalKm = await DailyLog.aggregate([
        {
          $match: {
            driverId: user._id
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$km"
            }
          }
        }
      ]);

      const totalKmValue =
        totalKm[0]?.total || 0;

      // ===========================
      // TOTAL HOURS
      // ===========================

      const totalHours = await DailyLog.aggregate([
        {
          $match: {
            driverId: user._id
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$hours"
            }
          }
        }
      ]);

      const totalHoursValue =
        totalHours[0]?.total || 0;

      // ===========================
      // LAST 7 DUTIES AVERAGE
      // ===========================

      const last7Logs = await DailyLog.find({
        driverId: userId,
        signOutTime: { $ne: null }
      })
        .sort({ signOutTime: -1 })
        .limit(5);

      let last7Km = 0;
      let last7Hours = 0;

      last7Logs.forEach(log => {

        last7Km += Number(log.km || 0);

        last7Hours += Number(log.hours || 0);

      });

      const avgKmPerDay =
        last7Logs.length
          ? last7Km / last7Logs.length
          : 0;

      const avgHoursPerDay =
        last7Logs.length
          ? last7Hours / last7Logs.length
          : 0;

      // ===========================
      // >9 HOURS / <=9 HOURS
      // ===========================

      const allLogs = await DailyLog.find({
        driverId: userId
      });

      let daysAbove9Hours = 0;

      let daysBelow9Hours = 0;

      allLogs.forEach(log => {

        let hours = Number(log.hours || 0);

        if (
          (!hours || hours <= 0) &&
          log.signInTime &&
          log.signOutTime
        ) {

          hours =
            (new Date(log.signOutTime) -
              new Date(log.signInTime))
            / (1000 * 60 * 60);

        }

        // If invalid hours treat as <=9
        // so Above + Below = Total Logs

        if (hours > 9)

          daysAbove9Hours++;

        else

          daysBelow9Hours++;

      });

      // ===========================
      // SUMMARY
      // ===========================

      response.summary = {

        totalDutyLogs: totalLogs,

        totalKm: Number(
          totalKmValue.toFixed(2)
        ),

        totalHours: Number(
          totalHoursValue.toFixed(2)
        ),

        totalTCards:
          await TCardChecklist.countDocuments({
            driverId: userId
          }),

        avgKmPerDay: Number(
          avgKmPerDay.toFixed(2)
        ),

        avgHoursPerDay: Number(
          avgHoursPerDay.toFixed(2)
        ),

        daysAbove9Hours,

        daysBelow9Hours

      };

    }

    // For managers, get driver count in their depot
    if (user.role === "DEPOT_MANAGER") {
      const driversInDepot = await User.countDocuments({
        role: "DRIVER",
        depotName: user.depotName
      });

      response.summary = {
        driversInDepot
      };
    }

    res.json(response);

  } catch (err) {
    console.error("getUserDetails error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get T-Card checklist for a specific user by date
 * Supports date filtering for efficient navigation
 *
 * @route GET /admin/users/:userId/tcards
 * @query date - Optional date filter (YYYY-MM-DD format)
 */
export const getUserTCards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const TCardChecklist = (await import("../models/TCardChecklist.js")).default;
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const inScope = await isUserInScope(req.scope, userId);

    if (!inScope) {
      return res.status(403).json({
        msg: "Access denied to this user"
      });
    }

    let filter = { driverId: userId };

    // If date is provided, filter by that specific date
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const tcards = await TCardChecklist.find(filter)
      .sort({ date: -1 })
      .lean();

    // Also return list of available dates for the date picker
    const availableDates = await TCardChecklist.distinct("date", { driverId: userId });

    res.json({
      tcards,
      availableDates: availableDates.map(d => new Date(d).toISOString().split('T')[0]).sort().reverse(),
      totalCount: await TCardChecklist.countDocuments({ driverId: userId })
    });

  } catch (err) {
    console.error("getUserTCards error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Update user information (Admin only)
 * Can update both User and DriverProfile data
 *
 * @route PUT /admin/users/:userId
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      depotId,
      role,
      hrmsId,
      designation,
      basicPay,
      dateOfAppointment,
      dateOfEntryAsTWD,
      trainings,
      lrDetails
    } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // scope check via new service, replacing local canAccessUserInScope()
    const inScope = await isUserInScope(req.scope, targetUser._id);
    if (!inScope) return res.status(403).json({ msg: "Access denied to this user" });

    // --- preserved business rule: cannot touch Super Admin / Master Admin tiers via this endpoint ---
    if (["SUPER_ADMIN", "MASTER_ADMIN", "DISTRICT_ADMIN"].includes(targetUser.role) && req.scope.role !== "SUPER_ADMIN") {
      return res.status(403).json({ msg: "Cannot modify users at this tier" });
    }

    if (depotId) {
      const depotInScope = isDepotInScope(req.scope, depotId);
      if (!depotInScope) {
        return res.status(403).json({ msg: "Selected depot is outside your scope" });
      }
      const depot = await Depot.findById(depotId);
      if (!depot) return res.status(400).json({ msg: "Invalid depot" });
      targetUser.depotId = depot._id;
      targetUser.districtId = depot.districtId;
    }

    if (name) targetUser.name = name;

    // --- preserved business rule: role change only between DRIVER and MANAGER, never a promotion to admin tiers ---
    if (role && role !== targetUser.role) {
      if (["SUPER_ADMIN", "MASTER_ADMIN", "DISTRICT_ADMIN"].includes(role)) {
        return res.status(400).json({ msg: "Cannot promote to admin tier via this endpoint" });
      }
      if (["DRIVER", "DEPOT_MANAGER", "MANAGER"].includes(role)) {
        targetUser.role = role;
      }
    }

    await targetUser.save();

    // If user is a driver, update their profile
    if (targetUser.role === "DRIVER") {
      const profileUpdate = {};

      if (hrmsId) profileUpdate.hrmsId = hrmsId;
      if (designation) profileUpdate.designation = designation;
      if (basicPay !== undefined) profileUpdate.basicPay = basicPay;
      if (dateOfAppointment) profileUpdate.dateOfAppointment = new Date(dateOfAppointment);
      if (dateOfEntryAsTWD) profileUpdate.dateOfEntryAsTWD = new Date(dateOfEntryAsTWD);
      if (trainings) profileUpdate.trainings = trainings;
      if (lrDetails) profileUpdate.lrDetails = lrDetails;

      if (Object.keys(profileUpdate).length > 0) {
        await DriverProfile.findOneAndUpdate(
          { userId },
          { $set: profileUpdate },
          { upsert: true, new: true }
        );
      }
    }

    // Fetch updated data
    const updatedUser = await User.findById(userId).select("-password").lean();
    let profile = null;

    if (updatedUser.role === "DRIVER") {
      profile = await DriverProfile.findOne({ userId }).lean();
    }

    res.json({
      msg: "User updated successfully",
      user: updatedUser,
      profile
    });

  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Delete user (Admin only)
 * Also deletes associated DriverProfile, DailyLogs, and TCardChecklists
 *
 * @route DELETE /admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    const inScope = await isUserInScope(req.scope, targetUser._id);
    if (!inScope) return res.status(403).json({ msg: "Access denied to this user" });

    // --- preserved rule: Master Admin accounts can never be deleted ---
    if (targetUser.role === "MASTER_ADMIN") {
      return res.status(400).json({ msg: "Cannot delete Master Admin accounts" });
    }
    // --- preserved rule: only Master Admin can delete Super Admin/District Admin accounts ---
    if (["SUPER_ADMIN", "DISTRICT_ADMIN"].includes(targetUser.role) && req.scope.role !== "SUPER_ADMIN") {
      return res.status(403).json({ msg: "Only Super Admin can delete accounts at this tier" });
    }

    // Hard delete user and all associated data
    await User.findByIdAndDelete(targetUser._id);
    await DriverProfile.findOneAndDelete({ userId: targetUser._id });
    await DailyLog.deleteMany({ driverId: targetUser._id });

    const TCardChecklist = (await import("../models/TCardChecklist.js")).default;
    await TCardChecklist.deleteMany({ driverId: targetUser._id });

    res.json({ msg: "User and all associated data deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Reset user password (Admin only)
 * Resets password to PF Number and sets passwordChanged to false
 *
 * @route POST /admin/users/:userId/reset-password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const inScope = await isUserInScope(req.scope, user._id);
    if (!inScope) return res.status(403).json({ msg: "Access denied to this user" });

    // Reset password to the user's PF Number as promised by the UI
    const tempPassword = user.pfNo;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.passwordChanged = false;
    await user.save();

    res.json({
      msg: "Password reset successfully",
      tempPassword
    });

  } catch (err) {
    console.error("resetUserPassword error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Get all SUPER_ADMIN users
 *
 * @route GET /admin/super-admins
 */
export const getSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await User.find({ role: "SUPER_ADMIN" }).populate("districtId").select("-password");
    // Format them slightly to match the frontend expectations if needed
    const formatted = [];
    for (const sa of superAdmins) {
      let distName = sa.districtName;
      if (!distName && sa.districtId) distName = sa.districtId.name;
      if (!distName && sa.depotName) distName = getDistrictForDepot(sa.depotName);

      let distId = sa.districtId ? sa.districtId._id : null;
      if (!distId && distName) {
        const d = await District.findOne({ name: distName });
        if (d) distId = d._id;
      }

      formatted.push({
        id: sa._id,
        pfNo: sa.pfNo,
        name: sa.name,
        districtName: distName,
        districtId: distId,
        registeredAt: sa.createdAt ? sa.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      });
    }
    res.json(formatted);
  } catch (err) {
    console.error("getSuperAdmins error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* ======================================================
   UPDATE SUPER ADMIN PROFILE
====================================================== */
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const { targetId, name, pfNo, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Name is required" });
    }

    let userIdToUpdate = req.user.id; // default to self

    if (targetId && targetId !== req.user.id) {
      if (req.user.role !== "MASTER_ADMIN") {
        return res.status(403).json({ msg: "Only Master Admin can update other Super Admins' profiles" });
      }
      userIdToUpdate = targetId;
    }

    const userToUpdate = await User.findById(userIdToUpdate);
    if (!userToUpdate || userToUpdate.role !== "SUPER_ADMIN") {
      return res.status(404).json({ msg: "Super Admin not found" });
    }

    userToUpdate.name = name.trim();

    // Only MASTER_ADMIN can update pfNo and password
    if (req.user.role === "MASTER_ADMIN") {
      if (pfNo && pfNo.trim() !== userToUpdate.pfNo) {
        // Check for uniqueness
        const existing = await User.findOne({ pfNo: pfNo.trim() });
        if (existing && existing.id !== userToUpdate.id) {
          return res.status(400).json({ msg: "PF Number is already assigned to another user" });
        }
        userToUpdate.pfNo = pfNo.trim();
      }

      if (password && password.trim()) {
        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        userToUpdate.password = hashedPassword;
        userToUpdate.passwordChanged = false; // Force them to change it again if you want, or just leave it
      }
    } else {
      if (pfNo && pfNo.trim() !== userToUpdate.pfNo) {
        return res.status(403).json({ msg: "Only Master Admin can modify PF Number" });
      }
      if (password && password.trim()) {
        return res.status(403).json({ msg: "Only Master Admin can modify Password directly from this endpoint" });
      }
    }

    await userToUpdate.save();

    res.json({ msg: "Profile updated successfully", name: userToUpdate.name, pfNo: userToUpdate.pfNo });
  } catch (err) {
    console.error("updateSuperAdminProfile error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* ======================================================
   GET ALL DISTRICTS (MASTER ADMIN)
====================================================== */
export const getDistricts = async (req, res) => {
  try {
    const districts = [];
    for (const name of DISTRICT_NAMES) {
      const doc = await District.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, new: true }
      );
      districts.push({ _id: doc._id, name: doc.name });
    }
    res.json(districts);
  } catch (err) {
    console.error("getDistricts error:", err);
    res.status(500).json({ msg: err.message });
  }
};
