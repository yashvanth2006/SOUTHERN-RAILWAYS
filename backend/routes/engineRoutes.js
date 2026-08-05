import express from "express";

import {
  createEngine,
  getEnginesByDepot,
  getEngineById,
  updateEngine,
  getAvailableDepots,
  deleteEngine
} from "../controllers/engineController.js";

import {
  verifyToken,
  allowRoles
} from "../middleware/auth.js";

const router = express.Router();

/* ============================================
   CREATE ENGINE
   SUPER ADMIN ONLY
============================================ */

router.post(
  "/",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  createEngine
);

/* ============================================
   GET ENGINES OF A DEPOT
   DRIVER / ADEE / DEPOT MANAGER / SUPER ADMIN
============================================ */

router.get(
  "/",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER",
    "DRIVER"
  ),
  getEnginesByDepot
);

/* ============================================
   GET SINGLE ENGINE DETAILS
============================================ */
router.get(
  "/depots/list",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER",
    "DRIVER"
  ),
  getAvailableDepots
);

router.get(
  "/:id",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER",
    "DRIVER"
  ),
  getEngineById
);

/* ============================================
   UPDATE ENGINE
   DEPOT MANAGER (OWN DEPOT)
   SUPER ADMIN (ALL)
============================================ */

router.put(
  "/:id",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "DEPOT_MANAGER"
  ),
  updateEngine
);

/* ============================================
   DELETE ENGINE
   SUPER ADMIN ONLY
============================================ */

router.delete(
  "/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  deleteEngine
);

export default router;