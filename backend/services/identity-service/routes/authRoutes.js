import express from "express";
import { login, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/change-password", verifyToken, changePassword);

// Token validation endpoint — used by ProtectedRoute to verify token is still valid
router.get("/me", verifyToken, (req, res) => {
  res.json({ valid: true, userId: req.user.id, role: req.user.role });
});

export default router;
