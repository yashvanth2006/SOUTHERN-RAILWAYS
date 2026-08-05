import Abnormality from "../models/Abnormality.js";
import User from "../models/User.js";

/* =====================================================
   DRIVER - SUBMIT ABNORMALITY
===================================================== */
export const submitAbnormality = async (req, res) => {
  try {

    const {
      towerCarNo,
      abnormalities
    } = req.body;

    if (!towerCarNo) {
      return res.status(400).json({
        msg: "Tower Car Number is required"
      });
    }

    if (
      !abnormalities ||
      !Array.isArray(abnormalities) ||
      abnormalities.length !== 6
    ) {
      return res.status(400).json({
        msg: "All 6 abnormalities are required."
      });
    }

    // Prevent duplicate submission for same day

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const existing = await Abnormality.findOne({

      driverId: req.user.id,

      createdAt: {

        $gte: today,

        $lt: tomorrow

      }

    });

    if (existing) {

      return res.status(400).json({

        msg: "Today's abnormality report already submitted."

      });

    }

    const user = await User.findById(req.user.id);

    const report = await Abnormality.create({

      driverId: req.user.id,

      depotName: user.depotName,

      towerCarNo,

      abnormalities,

      status: "Pending"

    });

    res.json({

      msg: "Abnormality report submitted successfully.",

      report

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }
};

/* =====================================================
   GET ABNORMALITIES
===================================================== */


export const getAbnormalities = async (req, res) => {
  try {

    const today = new Date();

    const last30Days = new Date();

    last30Days.setDate(today.getDate() - 30);

    let filter = {

      createdAt: {

        $gte: last30Days

      }

    };

    /* =========================================
       DEPOT FILTERING BASED ON ROLE
    ========================================= */

    if (req.user.role === "DEPOT_MANAGER") {

      filter.depotName = req.user.depotName;

    }

    else if (req.user.role === "ADEE") {

      filter.depotName = {

        $in: req.user.assignedDepots || []

      };

    }

    else if (

      req.user.role === "SUPER_ADMIN" &&

      req.query.depot

    ) {

      filter.depotName = req.query.depot;

    }

    const reports = await Abnormality.find(filter)

      .sort({

        createdAt: -1

      })

      .lean();

    const response = [];

    for (const report of reports) {

      const driver = await User.findById(report.driverId)

        .select("name pfNo depotName")

        .lean();

      if (!driver) continue;

      response.push({

        _id: report._id,

        driverId: driver._id,

        driverName: driver.name,

        pfNo: driver.pfNo,

        depotName: driver.depotName,

        towerCarNo: report.towerCarNo,

        abnormalities: report.abnormalities,

        status: report.status,

        actionTaken: report.actionTaken,

        resolvedBy: report.resolvedBy,

        resolvedAt: report.resolvedAt,

        createdAt: report.createdAt

      });

    }

    res.json(response);

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};
/* =====================================================
   DRIVER - MY ABNORMALITIES
===================================================== */

export const getDriverAbnormalities = async (req, res) => {
  try {

    const data = await Abnormality.find({
      driverId: req.user.id
    }).sort({
      createdAt: -1
    });

    res.json(data);

  } catch (err) {

    res.status(500).json({
      msg: "Server Error"
    });

  }
};

/* =====================================================
   DEPOT MANAGER
   ACTION TAKEN
===================================================== */

export const resolveAbnormality = async (req, res) => {
  try {

    // Only Depot Manager can resolve

    if (req.user.role !== "DEPOT_MANAGER") {

      return res.status(403).json({
        msg: "Only Depot Manager can perform this action"
      });

    }

    const { id } = req.params;

    const { actionTaken } = req.body;

    if (!actionTaken || actionTaken.trim() === "") {

      return res.status(400).json({
        msg: "Action Taken is required"
      });

    }

    const report = await Abnormality.findById(id);

    if (!report) {

      return res.status(404).json({
        msg: "Report not found"
      });

    }

    // Security check
    // Manager should resolve only his depot reports

    if (report.depotName !== req.user.depotName) {

      return res.status(403).json({
        msg: "Access denied"
      });

    }

    report.status = "Action Taken";

    report.actionTaken = actionTaken;

    report.resolvedBy = req.user.id;

    report.resolvedAt = new Date();

    await report.save();

    res.json({

      msg: "Report updated successfully",

      report

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }

};