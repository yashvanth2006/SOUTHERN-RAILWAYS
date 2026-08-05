import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
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
  getDutyStatus
} from "../controllers/driverController.js"; 
import { saveTCard } from "../controllers/tcardController.js";

const router = express.Router();

router.get("/profile", verifyToken, allowRoles("DRIVER"), getDriverProfile);

router.put("/profile/bio", verifyToken, allowRoles("DRIVER"), updateBioData);
router.put("/profile/training", verifyToken, allowRoles("DRIVER"), updateTraining);
router.put("/profile/lr", verifyToken, allowRoles("DRIVER"), updateLR);

router.post("/signin", verifyToken, allowRoles("DRIVER"), uploadImage.single("image"),driverSignIn);
router.post("/signout", verifyToken, allowRoles("DRIVER"), uploadImage.single("image"),driverSignOut);

router.get("/alerts", verifyToken, allowRoles("DRIVER"), driverAlerts);
router.get(
  "/active-duty",
  verifyToken,
  allowRoles("DRIVER"),
  checkActiveDuty
);

router.get(
  "/duty-status",
  verifyToken,
  allowRoles("DRIVER"),
  getDutyStatus
);

router.post(
  "/tcard",
  verifyToken,
  allowRoles("DRIVER"),
  saveTCard
);

export default router;
