import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import {
  adminRegisterUser,
  getAdminReport,
  getAdminUsers,
  getDistinctDepots,
  downloadAdminReport,
  getUserDetails,
  getUserTCards,
  updateUser,
  deleteUser,
  resetUserPassword,
  getOverdueRecords
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= REPORTS ================= */
router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  getAdminReport
);

router.get(
   "/overdue-records",
   verifyToken,
   allowRoles("SUPER_ADMIN","ADEE","DEPOT_MANAGER"),
   getOverdueRecords
);

/* ================= REGISTER USER ================= */
/* 🔥 ONLY SUPER ADMIN CAN CREATE ADEE */
router.post(
  "/register",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  adminRegisterUser
);

/* ================= DEPOTS ================= */
router.get(
  "/depots",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  getDistinctDepots
);

/* ================= USERS ================= */
router.get(
  "/users",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  getAdminUsers
);

router.get(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  getUserDetails
);

router.put(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  updateUser
);

router.delete(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  deleteUser
);

router.post(
  "/users/:userId/reset-password",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  resetUserPassword
);

router.get(
  "/users/:userId/tcards",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  getUserTCards
);

router.get(
  "/reports/download",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE"),
  downloadAdminReport
);

export default router;