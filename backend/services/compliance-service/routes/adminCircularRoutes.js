import express from "express";
import upload from "../middleware/multer.js";
import {
  uploadCircular,
  getCirculars,
  getCircularPDF,
  acknowledgeCircular,
  getCircularAcknowledgementReport,
  deleteCircular
} from "../controllers/circularController.js";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post(
  "/circulars",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  authorize("CIRCULAR_CREATE"),
  upload.single("pdf"),
  uploadCircular
);
router.get("/circulars", verifyToken, authorize("CIRCULAR_VIEW"), getCirculars);
router.post(
  "/circulars/:id/acknowledge",
  verifyToken,
  authorize("CIRCULAR_ACKNOWLEDGE"),
  acknowledgeCircular
);

router.get(
  "/circulars/acknowledgement-report",
  verifyToken,
  authorize("CIRCULAR_VIEW"),
  getCircularAcknowledgementReport
);
router.get("/circulars/:id/pdf", verifyToken, authorize("CIRCULAR_VIEW"), getCircularPDF);

router.delete(
  "/circulars/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN"),
  authorize("CIRCULAR_DELETE"),
  deleteCircular
);

export default router;
