import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const {
      name,
      pfNo,
      email,
      password,
      role,
      depotName,
      profile
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!name || !pfNo || !password || !role) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    /* ---------- CHECK EXISTING ---------- */
    const existing = await User.findOne({ pfNo });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    /* ---------- DRIVER-ONLY VALIDATION ---------- */
    if (role === "DRIVER") {
      if (!profile || !profile.hrmsId) {
        return res.status(400).json({
          msg: "HRMS ID is required for driver registration"
        });
      }
    }

    /* ---------- CREATE USER ---------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      pfNo,
      email,
      password: hashedPassword,
      role,
      depotName
    });

    /* ---------- CREATE DRIVER PROFILE ONLY FOR DRIVER ---------- */
    if (role === "DRIVER") {
      await DriverProfile.create({
        userId: user._id,
        ...profile
      });
    }

    res.status(201).json({
      msg: `${role} registered successfully`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { pfNo, password } = req.body;

    const user = await User.findOne({ pfNo });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

   const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    depotName: user.depotName,
    assignedDepots: user.assignedDepots || []
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      token,
      role: user.role,
      passwordChanged: user.passwordChanged || false,
      depotName:user.depotName,
  assignedDepots: user.assignedDepots || []

    });

  } catch {
     console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Login failed" });
  }
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        msg: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Current password is incorrect" });
    }

    // Prevent using same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        msg: "New password must be different from current password"
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      passwordChanged: true
    });

    res.json({ msg: "Password changed successfully" });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Failed to change password" });
  }
};

