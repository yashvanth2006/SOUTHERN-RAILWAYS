import express from "express";
import {
    getIssues,
    resolveIssue
} from "../controllers/issueController.js";

import {
  verifyToken,
  allowRoles
} from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER",
    "MASTER_ADMIN"
  ),
  authorize("ISSUE_VIEW"),
  getIssues
);

router.put(
    "/:id/resolve",
    verifyToken,
    allowRoles(
        "DEPOT_MANAGER"
    ),
    authorize("ISSUE_RESOLVE"),
    resolveIssue
);

export default router;