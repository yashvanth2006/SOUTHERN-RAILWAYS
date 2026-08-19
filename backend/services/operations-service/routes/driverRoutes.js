import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import uploadImage from "../middleware/imageUpload.js";
import {
  getDriverProfile,
  updateBioData,
  updateTraining,
  updateLR,
  driverSignIn,
  driverSignOut,
  driverAlerts,
  checkActiveDuty,
  getDutyStatus,
  getLRDepots
} from "../controllers/driverController.js";
import { saveTCard } from "../controllers/tcardController.js";

const router = express.Router();

router.get("/profile", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_PROFILE_VIEW"), getDriverProfile);

router.put("/profile/bio", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_PROFILE_UPDATE"), updateBioData);
router.put("/profile/training", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_PROFILE_UPDATE"), updateTraining);
router.put("/profile/lr", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_PROFILE_UPDATE"), updateLR);
router.get("/lr-depots", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_LR_DEPOTS"), getLRDepots);

router.post("/signin", verifyToken, allowRoles("DRIVER"), authorize("DUTY_SIGN_IN"), uploadImage.single("image"), driverSignIn);
router.post("/signout", verifyToken, allowRoles("DRIVER"), authorize("DUTY_SIGN_OUT"), uploadImage.single("image"), driverSignOut);

router.get("/alerts", verifyToken, allowRoles("DRIVER"), authorize("DRIVER_ALERTS"), driverAlerts);
router.get(
  "/active-duty",
  verifyToken,
  allowRoles("DRIVER"),
  authorize("DUTY_VIEW"),
  checkActiveDuty
);

router.get(
  "/duty-status",
  verifyToken,
  allowRoles("DRIVER"),
  authorize("DUTY_VIEW"),
  getDutyStatus
);

router.post(
  "/tcard",
  verifyToken,
  allowRoles("DRIVER"),
  authorize("TCARD_CREATE"),
  saveTCard
);

export default router;
