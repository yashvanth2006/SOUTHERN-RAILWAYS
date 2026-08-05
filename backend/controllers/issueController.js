import TCardChecklist from "../models/TCardChecklist.js";
import User from "../models/User.js";

export const getIssues = async (req, res) => {

  try {

    const loggedInUser = await User.findById(req.user.id);

    if (!loggedInUser) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    /* ==========================
       LAST 30 DAYS
    ========================== */

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    /* ==========================
       GET ISSUE CHECKLISTS
    ========================== */

    const checklists = await TCardChecklist.find({

      date: {
        $gte: fromDate
      },

      // "issue.isIssue": true

  "issue.isIssue": true,

  "issue.status": "Pending"
    }).populate(
      "driverId",
      "name pfNo depotName"
    );

    const result = [];

    for (const checklist of checklists) {

      const driver = checklist.driverId;

      if (!driver) continue;

      /* ==========================
         ROLE FILTER
      ========================== */

      if (loggedInUser.role === "DEPOT_MANAGER") {

        if (
          driver.depotName !==
          loggedInUser.depotName
        ) {
          continue;
        }

      }

      if (loggedInUser.role === "ADEE") {

        if (
          !loggedInUser.assignedDepots.includes(
            driver.depotName
          )
        ) {
          continue;
        }

      }

      /* ==========================
         EACH HIGH PRIORITY ITEM
      ========================== */

      checklist.items.forEach(item => {

        if (
          item.priority === "HIGH" &&
          (item.remarks || "").trim() !== ""
        ) {

          result.push({

            checklistId: checklist._id,

            driverId: driver._id,

            driverName: driver.name,

            pfNo: driver.pfNo,

            depot: driver.depotName,

            towerCar: checklist.tCarNo,

            checklistType: item.description,

            remarks: item.remarks,

            priority: item.priority,

            status: checklist.issue.status,

            checklistDate: checklist.date,

            resolvedAt: checklist.issue.resolvedAt

          });

        }

      });

    }

    result.sort(
      (a, b) =>
        new Date(b.checklistDate) -
        new Date(a.checklistDate)
    );

    res.json(result);

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }

};

export const resolveIssue = async (req, res) => {

  try {

    /* ======================================
       ONLY DEPOT MANAGER
    ====================================== */

    if (req.user.role !== "DEPOT_MANAGER") {

      return res.status(403).json({
        msg: "Only Depot Manager can resolve issues."
      });

    }

    const checklist = await TCardChecklist.findById(req.params.id)
      .populate("driverId", "depotName");

    if (!checklist) {

      return res.status(404).json({
        msg: "Issue not found."
      });

    }

    /* ======================================
       DEPOT SECURITY
    ====================================== */

    if (
      checklist.driverId.depotName !==
      req.user.depotName
    ) {

      return res.status(403).json({
        msg: "You can resolve only your depot issues."
      });

    }

    /* ======================================
       ALREADY RESOLVED
    ====================================== */

    if (checklist.issue.status === "Resolved") {

      return res.status(400).json({
        msg: "Issue already resolved."
      });

    }

    /* ======================================
       UPDATE
    ====================================== */

    checklist.issue.status = "Resolved";

    checklist.issue.resolvedBy = req.user.id;

    checklist.issue.resolvedAt = new Date();

    await checklist.save();

    res.json({

      msg: "Issue resolved successfully."

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      msg: err.message

    });

  }

};

