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

const router = express.Router();

/* ===========================================
   DRIVER
=========================================== */

// Submit abnormality
router.post(
  "/",
  verifyToken,
  allowRoles("DRIVER"),
  submitAbnormality
);

// Driver's own abnormalities
router.get(
  "/my",
  verifyToken,
  allowRoles("DRIVER"),
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
    "SUPER_ADMIN"
  ),
  getAbnormalities
);

// Resolve abnormality
router.put(
  "/:id/resolve",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  resolveAbnormality
);

export default router;