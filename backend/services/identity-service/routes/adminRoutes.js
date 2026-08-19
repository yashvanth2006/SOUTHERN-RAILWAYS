import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import {
  adminRegisterUserV2,
  getAdminReport,
  getAdminUsers,
  getDistinctDepots,
  downloadAdminReport,
  getUserDetails,
  getUserTCards,
  updateUser,
  deleteUser,
  resetUserPassword,
  getOverdueRecords,
  getSuperAdmins,
  getDistricts,
  updateSuperAdminProfile
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= REPORTS ================= */
router.get(
  "/reports",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("REPORT_VIEW"),
  getAdminReport
);

router.get(
   "/overdue-records",
   verifyToken,
   allowRoles("SUPER_ADMIN","ADEE","DEPOT_MANAGER", "MASTER_ADMIN"),
   authorize("REPORT_VIEW_OVERDUE"),
   getOverdueRecords
);

/* ================= REGISTER USER ================= */
/* 🔥 ONLY SUPER ADMIN CAN CREATE ADEE */
/* 🔥 MASTER ADMIN CAN CREATE SUPER ADMIN */
router.post(
  "/register",
  verifyToken,
  allowRoles("SUPER_ADMIN", "MASTER_ADMIN"),
  authorize("USER_CREATE"),
  adminRegisterUserV2
);

/* ================= GET/UPDATE SUPER ADMINS ================= */
router.get(
  "/super-admins",
  verifyToken,
  allowRoles("MASTER_ADMIN"),
  authorize("SUPER_ADMIN_VIEW"),
  getSuperAdmins
);

router.put(
  "/super-admins/profile",
  verifyToken,
  allowRoles("MASTER_ADMIN", "SUPER_ADMIN"),
  authorize("SUPER_ADMIN_UPDATE"),
  updateSuperAdminProfile
);

/* ================= DEPOTS ================= */
router.get(
  "/depots",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("DEPOT_VIEW"),
  getDistinctDepots
);

/* ================= DISTRICTS ================= */
router.get(
  "/districts",
  verifyToken,
  allowRoles("MASTER_ADMIN", "SUPER_ADMIN"),
  authorize("DISTRICT_VIEW"),
  getDistricts
);

/* ================= USERS ================= */
router.get(
  "/users",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("USER_VIEW"),
  getAdminUsers
);

router.get(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("USER_VIEW"),
  getUserDetails
);

router.put(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("USER_UPDATE"),
  updateUser
);

router.delete(
  "/users/:userId",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("USER_DELETE"),
  deleteUser
);

router.post(
  "/users/:userId/reset-password",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("USER_RESET_PASSWORD"),
  resetUserPassword
);

router.get(
  "/users/:userId/tcards",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("TCARD_VIEW"),
  getUserTCards
);

router.get(
  "/reports/download",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADEE", "MASTER_ADMIN"),
  authorize("REPORT_EXPORT"),
  downloadAdminReport
);

export default router;
