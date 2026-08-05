import express from "express";
import {
    getIssues,
    resolveIssue
} from "../controllers/issueController.js";

import {
  verifyToken
} from "../middleware/auth.js";

import {
  allowRoles
} from "../middleware/auth.js";

// import {
//   getIssues
// } from "../controllers/issueController.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADEE",
    "DEPOT_MANAGER"
  ),
  getIssues
);

router.put(
    "/:id/resolve",
    verifyToken,
    allowRoles(
        "DEPOT_MANAGER"
    ),
    resolveIssue
);

export default router;