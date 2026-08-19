import TCardChecklist from "../models/TCardChecklist.js";
import User from "../models/User.js";
import { isUserInScope } from "../services/authorization/scopeService.js";

export const getDriverTCardsForDepot = async (req, res) => {
  try {
    const { driverId } = req.params;

    const inScope = await isUserInScope(req.scope, driverId);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const cards = await TCardChecklist.find({
      driverId
    }).sort({ date: -1 });

    res.json(cards);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const saveTCard = async (req, res) => {
  const { tCarNo, items } = req.body;

  if (!tCarNo || !items?.length) {
    return res.status(400).json({ msg: "Incomplete checklist" });
  }

  // const today = new Date();
  // today.setHours(0, 0, 0, 0);
const now = new Date();

// Convert IST date → store as UTC midnight correctly
const istDate = new Date(
  now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);

// IMPORTANT FIX
const today = new Date(
  Date.UTC(
    istDate.getFullYear(),
    istDate.getMonth(),
    istDate.getDate()
  )
);
  const existing = await TCardChecklist.findOne({
    driverId: req.scope.userId,
    date: today
  });

  if (existing) {
    return res.status(400).json({
      msg: "Today's checklist already submitted"
    });
  }

const hasIssue = items.some(item =>
  item.priority === "HIGH" &&
  item.remarks &&
  (item.remarks || "").trim() !== ""
);

// ==========================================
// SAVE CHECKLIST
// ==========================================

await TCardChecklist.create({

  driverId: req.scope.userId,

  tCarNo,

  items,

  date: today,

  issue: {

    isIssue: hasIssue,

    status: hasIssue ? "Pending" : null,

    resolvedBy: null,

    resolvedAt: null

  }

});
  res.json({ msg: "Daily T-Card checklist saved" });
};
