import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { getDepotDailyLogs, getDepotDrivers, getDepotReport, getDriverFullProfile } from "../controllers/depotController.js";
import { getDriverTCardsForDepot } from "../controllers/tcardController.js";

const router = express.Router();

router.get(
  "/drivers",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("DRIVER_VIEW"),
  getDepotDrivers
);
router.get("/daily-logs", verifyToken, allowRoles("DEPOT_MANAGER"), authorize("DUTY_VIEW"), getDepotDailyLogs);
router.get(
  "/reports",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("DUTY_VIEW"),
  getDepotReport
);

router.get(
  "/driver/:driverId",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("DRIVER_VIEW"),
  getDriverFullProfile
);

router.get(
  "/driver/:driverId/tcards",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("TCARD_VIEW"),
  getDriverTCardsForDepot
);

export default router;
