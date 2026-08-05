// import express from "express";
// import { verifyToken, allowRoles } from "../middleware/auth.js";
// import {
//   uploadCircular,
//   getCirculars,
//   getLatestCircular,
//   acknowledgeCircular,
//   checkAcknowledgementStatus,
//   getCircularAcknowledgementReport,
//   streamCircularPdf
// } from "../controllers/circularController.js";
// import { upload } from "../utils/cloudinary.js";

// const router = express.Router();

// // import { serveCircularPdf } from "../controllers/circularController.js";




// // POST /api/admin/circulars → Upload PDF (Admin only)
// router.post(
//   "/circulars",
//   verifyToken,
//   allowRoles("SUPER_ADMIN"),
//   upload.single("pdf"),
//   uploadCircular
// );

// // GET /api/admin/circulars → Get all circulars (all roles can view list)
// router.get(
//   "/circulars",
//   verifyToken,
//   allowRoles("SUPER_ADMIN", "DEPOT_MANAGER", "DRIVER"),
//   getCirculars
// );

// // GET /api/admin/circulars/acknowledgement-report → Admin view of all users' acknowledgement status
// router.get(
//   "/circulars/acknowledgement-report",
//   verifyToken,
//   allowRoles("SUPER_ADMIN"),
//   getCircularAcknowledgementReport
// );

// // GET /api/admin/circulars/latest → Get latest circular for acknowledgement
// // Only DRIVER and DEPOT_MANAGER need to acknowledge (not SUPER_ADMIN)
// router.get(
//   "/circulars/latest",
//   verifyToken,
//   allowRoles("DEPOT_MANAGER", "DRIVER"),
//   getLatestCircular
// );

// // POST /api/admin/circulars/acknowledge → Acknowledge a circular
// // Only DRIVER and DEPOT_MANAGER need to acknowledge
// router.post(
//   "/circulars/acknowledge",
//   verifyToken,
//   allowRoles("DEPOT_MANAGER", "DRIVER"),
//   acknowledgeCircular
// );

// // GET /api/admin/circulars/status → Check acknowledgement status
// // Only DRIVER and DEPOT_MANAGER need acknowledgement status
// router.get(
//   "/circulars/status",
//   verifyToken,
//   allowRoles("DEPOT_MANAGER", "DRIVER"),
//   checkAcknowledgementStatus
// );

// router.get(
//   "/circulars/:id/pdf",
  
//   streamCircularPdf
// );


// export default router;
