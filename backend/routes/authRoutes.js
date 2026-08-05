import express from "express";
import { login, register, changePassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", verifyToken, changePassword);

export default router;
