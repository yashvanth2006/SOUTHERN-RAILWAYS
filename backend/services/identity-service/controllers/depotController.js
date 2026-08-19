import User from "../models/User.js";
import DailyLog from "../models/DailyLog.js";
import Circular from "../models/Circular.js";
import DriverProfile from "../models/DriverProfile.js";
import Depot from "../models/Depot.js";
import { depotFilterFor, isUserInScope } from "../services/authorization/scopeService.js";

/**
 * Get full driver profile for Depot Manager view
 * Includes profile, logs, and circular status
 */
export const getDriverFullProfile = async (req, res) => {
  try {
    const { driverId } = req.params;

    const inScope = await isUserInScope(req.scope, driverId);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied to this driver" });
    }

    const user = await User.findOne({
      _id: driverId,
      role: "DRIVER"
    }).select("-password").lean();

    if (!user) {
      return res.status(404).json({ msg: "Driver not found" });
    }

    const profile = await DriverProfile.findOne({ userId: driverId }).lean();
    const logs = await DailyLog.find({ driverId }).sort({ logDate: -1 }).limit(30).lean();

    // Get circular acknowledgement status
    const latestCircular = await Circular.findOne().sort({ createdAt: -1 }).select("_id title").lean();
    let circularStatus = {
      acknowledged: true,
      lastAcknowledgedCircularId: user.lastAcknowledgedCircularId
    };

    if (latestCircular) {
      circularStatus.latestCircularId = latestCircular._id;
      circularStatus.latestCircularTitle = latestCircular.title;
      circularStatus.acknowledged = !!(user.lastAcknowledgedCircularId &&
        user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString());
    }

    const totalLogs = await DailyLog.countDocuments({ driverId });

    // Total KM
    const kmAgg = await DailyLog.aggregate([
      { $match: { driverId: user._id } },
      { $group: { _id: null, total: { $sum: "$km" } } }
    ]);
    const totalKmValue = kmAgg[0]?.total || 0;

    // Total Hours
    const hoursAgg = await DailyLog.aggregate([
      { $match: { driverId: user._id } },
      { $group: { _id: null, total: { $sum: "$hours" } } }
    ]);
    const totalHoursValue = hoursAgg[0]?.total || 0;

    // ==============================
    // LAST 7 DUTIES AVERAGE
    // ==============================
    const last7Logs = await DailyLog.find({ driverId, signOutTime: { $ne: null } })
      .sort({ signOutTime: -1 })
      .limit(7);

    let last7Km = 0;
    let last7Hours = 0;
    last7Logs.forEach(log => {
      last7Km += Number(log.km || 0);
      last7Hours += Number(log.hours || 0);
    });

    const avgKmPerDay = last7Logs.length ? last7Km / last7Logs.length : 0;
    const avgHoursPerDay = last7Logs.length ? last7Hours / last7Logs.length : 0;

    // ==============================
    // >=9 / <9 HOURS
    // ==============================
    const allLogs = await DailyLog.find({ driverId });
    let daysAbove9Hours = 0;
    let daysBelow9Hours = 0;

    allLogs.forEach(log => {
      let hours = Number(log.hours || 0);
      if ((!hours || hours <= 0) && log.signInTime && log.signOutTime) {
        hours = (new Date(log.signOutTime) - new Date(log.signInTime)) / (1000 * 60 * 60);
      }

      if (hours > 9) daysAbove9Hours++;
      else daysBelow9Hours++;
    });

    res.json({
      ...user,
      profile,
      logs,
      circularStatus,
      summary: {
        totalDutyLogs: totalLogs,
        totalKm: Number(totalKmValue.toFixed(2)),
        totalHours: Number(totalHoursValue.toFixed(2)),
        avgKmPerDay: Number(avgKmPerDay.toFixed(2)),
        avgHoursPerDay: Number(avgHoursPerDay.toFixed(2)),
        daysAbove9Hours,
        daysBelow9Hours
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Current function to get only drivers (keep it if needed)
export const getDepotDrivers = async (req, res) => {
  try {
    const drivers = await User.find({
      role: "DRIVER",
      status: "ACTIVE",
      ...depotFilterFor(req.scope)
    })
      .select("name pfNo depotName")
      .sort({ name: 1 });

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// NEW: Get depot drivers + their daily logs
export const getDepotDailyLogs = async (req, res) => {
  try {
    const drivers = await User.find({
      role: "DRIVER",
      ...depotFilterFor(req.scope)
    });

    const logs = [];

    for (let driver of drivers) {
      const driverLogs = await DailyLog.find({ driverId: driver._id })
        .sort({ signInTime: -1 }); // latest logs first

      logs.push({
        driverName: driver.name,
        pfNo: driver.pfNo,
        dailyLogs: driverLogs
      });
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getDepotReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const drivers = await User.find({
      role: "DRIVER",
      ...depotFilterFor(req.scope)
    });

    const report = [];

    for (let driver of drivers) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      const logs = await DailyLog.find({
        driverId: driver._id,
        logDate: {
          $gte: start,
          $lte: end
        }
      });

      const totalHours = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
      const totalKm = logs.reduce((sum, l) => sum + (l.km || 0), 0);

      report.push({
        driverName: driver.name,
        pfNo: driver.pfNo,
        totalDays: logs.length,
        totalHours,
        totalKm,
        logs
      });
    }
    
    // Attempt to determine depot name for response
    let reportDepot = "Multiple Depots";
    if (req.scope.depotIds && Array.isArray(req.scope.depotIds) && req.scope.depotIds.length === 1) {
      const dep = await Depot.findById(req.scope.depotIds[0]);
      if (dep) reportDepot = dep.name;
    }

    res.json({
      depot: reportDepot,
      from,
      to,
      report
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
