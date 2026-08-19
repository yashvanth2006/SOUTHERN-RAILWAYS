import express from "express";

import {
  submitAbnormality,
  getAbnormalities,
  getDriverAbnormalities,
  resolveAbnormality
} from "../controllers/abnormalityController.js";

import {
  verifyToken,
  allowRoles
} from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

/* ===========================================
   DRIVER
=========================================== */

// Submit abnormality
router.post(
  "/",
  verifyToken,
  allowRoles("DRIVER"),
  authorize("ABNORMALITY_CREATE"),
  submitAbnormality
);

// Driver's own abnormalities
router.get(
  "/my",
  verifyToken,
  allowRoles("DRIVER"),
  authorize("ABNORMALITY_VIEW"),
  getDriverAbnormalities
);

/* ===========================================
   MANAGER / ADEE / SUPER ADMIN
=========================================== */

// View abnormalities
router.get(
  "/",
  verifyToken,
  allowRoles(
    "DEPOT_MANAGER",
    "ADEE",
    "SUPER_ADMIN",
    "MASTER_ADMIN"
  ),
  authorize("ABNORMALITY_VIEW"),
  getAbnormalities
);

// Resolve abnormality
router.put(
  "/:id/resolve",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("ABNORMALITY_RESOLVE"),
  resolveAbnormality
);

export default router;