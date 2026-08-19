import Abnormality from "../models/Abnormality.js";
import User from "../models/User.js";
import Depot from "../models/Depot.js";
import { depotFilterFor, getDepotNameFilter, isUserInScope } from "../services/authorization/scopeService.js";
import { normalizeDepotName } from "../utils/accessScope.js"; // if needed

/* =====================================================
   DRIVER - SUBMIT ABNORMALITY
===================================================== */
export const submitAbnormality = async (req, res) => {
  try {
    const { towerCarNo, abnormalities } = req.body;

    if (!towerCarNo) {
      return res.status(400).json({ msg: "Tower Car Number is required" });
    }

    if (!abnormalities || !Array.isArray(abnormalities) || abnormalities.length !== 6) {
      return res.status(400).json({ msg: "All 6 abnormalities are required." });
    }

    // Prevent duplicate submission for same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await Abnormality.findOne({
      driverId: req.scope.userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({ msg: "Today's abnormality report already submitted." });
    }

    const user = await User.findById(req.scope.userId);

    const report = await Abnormality.create({
      driverId: req.scope.userId,
      depotName: user.depotName,
      towerCarNo,
      abnormalities,
      status: "Pending"
    });

    res.json({ msg: "Abnormality report submitted successfully.", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

/* =====================================================
   GET ABNORMALITIES
===================================================== */
export const getAbnormalities = async (req, res) => {
  try {
    const { depot } = req.query;
    
    // Query directly against Abnormality.depotName using scope strings
    const depotFilter = await getDepotNameFilter(req.scope, "depotName");
    const filter = { ...depotFilter };

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

      filter.depotName = normalizedDepot;
    }

    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);
    filter.createdAt = { $gte: last30Days };

    const reports = await Abnormality.find(filter)
      .populate("driverId", "name pfNo depotName")
      .sort({ createdAt: -1 })
      .lean();
      
    const response = reports.map(report => {
      const driver = report.driverId || { _id: null, name: "Unknown", pfNo: "N/A" };
      return {
        _id: report._id,
        driverId: driver._id,
        driverName: driver.name,
        pfNo: driver.pfNo,
        depotName: report.depotName,
        towerCarNo: report.towerCarNo,
        abnormalities: report.abnormalities,
        status: report.status,
        actionTaken: report.actionTaken,
        resolvedBy: report.resolvedBy,
        resolvedAt: report.resolvedAt,
        createdAt: report.createdAt
      };
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

/* =====================================================
   DRIVER - MY ABNORMALITIES
===================================================== */
export const getDriverAbnormalities = async (req, res) => {
  try {
    const data = await Abnormality.find({
      driverId: req.scope.userId
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

/* =====================================================
   MANAGER - ACTION TAKEN
===================================================== */
export const resolveAbnormality = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionTaken } = req.body;

    if (!actionTaken || actionTaken.trim() === "") {
      return res.status(400).json({ msg: "Action Taken is required" });
    }

    const report = await Abnormality.findById(id);

    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    const inScope = await isUserInScope(req.scope, report.driverId);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied" });
    }

    report.status = "Action Taken";
    report.actionTaken = actionTaken;
    report.resolvedBy = req.scope.userId;
    report.resolvedAt = new Date();

    await report.save();

    res.json({ msg: "Report updated successfully", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};
