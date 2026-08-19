import TCardChecklist from "../models/TCardChecklist.js";
import User from "../models/User.js";
import Depot from "../models/Depot.js";
import { depotFilterFor, isUserInScope } from "../services/authorization/scopeService.js";
import { normalizeDepotName } from "../utils/accessScope.js"; // if needed

export const getIssues = async (req, res) => {
  try {
    const { depot } = req.query;

    const driverFilter = {
      ...depotFilterFor(req.scope),
      role: "DRIVER"
    };

    if (depot) {
      const normalizedDepot = normalizeDepotName(depot);
      const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
      
      if (!reqDepotDoc) {
        return res.status(400).json({ msg: "Invalid depot" });
      }

      // Check if requested depot is in the actor's scope
      const inScope = req.scope.depotIds === "ALL" || (req.scope.depotIds || []).some(id => id.toString() === reqDepotDoc._id.toString());
      if (!inScope) {
        return res.status(403).json({ msg: "Selected depot is outside your scope" });
      }

      driverFilter.depotId = reqDepotDoc._id;
    }

    const drivers = await User.find(driverFilter).select("_id name pfNo depotName");
    const driverMap = new Map(drivers.map(d => [d._id.toString(), d]));
    const driverIds = drivers.map(d => d._id);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const checklists = await TCardChecklist.find({
      date: { $gte: fromDate },
      "issue.isIssue": true,
      "issue.status": "Pending",
      driverId: { $in: driverIds }
    });

    const result = [];

    for (const checklist of checklists) {
      const driver = driverMap.get(checklist.driverId.toString());
      if (!driver) continue;

      checklist.items.forEach(item => {
        if (item.priority === "HIGH" && (item.remarks || "").trim() !== "") {
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

    result.sort((a, b) => new Date(b.checklistDate) - new Date(a.checklistDate));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const resolveIssue = async (req, res) => {
  try {
    const checklist = await TCardChecklist.findById(req.params.id);

    if (!checklist) {
      return res.status(404).json({ msg: "Issue not found." });
    }

    const inScope = await isUserInScope(req.scope, checklist.driverId);
    if (!inScope) {
      return res.status(403).json({ msg: "You can resolve only your depot issues." });
    }

    if (checklist.issue.status === "Resolved") {
      return res.status(400).json({ msg: "Issue already resolved." });
    }

    checklist.issue.status = "Resolved";
    checklist.issue.resolvedBy = req.scope.userId;
    checklist.issue.resolvedAt = new Date();

    await checklist.save();

    res.json({ msg: "Issue resolved successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

