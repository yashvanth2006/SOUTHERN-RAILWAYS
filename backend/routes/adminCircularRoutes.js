import express from "express";
import upload from "../middleware/multer.js";
import {
  uploadCircular,
  getCirculars,
  getCircularPDF,
  acknowledgeCircular,
  getCircularAcknowledgementReport,
} from "../controllers/circularController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/circulars", upload.single("pdf"), uploadCircular);
router.get("/circulars", getCirculars);
router.post(
  "/circulars/:id/acknowledge",
  verifyToken,
  acknowledgeCircular
);

router.get(
  "/circulars/acknowledgement-report",
  verifyToken,
  getCircularAcknowledgementReport
);
router.get("/circulars/:id/pdf", getCircularPDF);

export default router;
