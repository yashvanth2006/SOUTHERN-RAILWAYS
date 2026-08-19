import express from "express";

import {
  createEngine,
  getEnginesByDepot,
  getEngineById,
  updateEngine,
  getAvailableDepots,
  deleteEngine,
  getTowerWagonList
} from "../controllers/engineController.js";

import {
  verifyToken,
  allowRoles
} from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

/* ============================================
   CREATE ENGINE
   DEPOT MANAGER ONLY
============================================ */

router.post(
  "/",
  verifyToken,
  allowRoles("DEPOT_MANAGER"),
  authorize("ENGINE_CREATE"),
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
  authorize("ENGINE_VIEW"),
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
  authorize("ENGINE_VIEW"),
  getAvailableDepots
);

router.get(
  "/tower-cars/list",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER",
    "DRIVER"
  ),
  authorize("ENGINE_VIEW"),
  getTowerWagonList
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
  authorize("ENGINE_VIEW"),
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
  authorize("ENGINE_UPDATE"),
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
  authorize("ENGINE_DELETE"),
  deleteEngine
);

export default router;