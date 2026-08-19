import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDistrictForDepot } from "../config/districtDepots.js";
import { resolveUserScope } from "../services/authorization/scopeService.js";
import { permissionsForRole } from "../services/authorization/permissionService.js";

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { pfNo, password } = req.body;

    const user = await User.findOne({ pfNo }).populate("districtId").populate("depotId");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    let districtName = user.districtName;
    if (!districtName && user.districtId) districtName = user.districtId.name;
    if (!districtName && user.depotId) districtName = user.depotId.districtName;
    if (!districtName && user.depotName) districtName = getDistrictForDepot(user.depotName);

    const scope = await resolveUserScope(user._id);

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        districtName,
        depotName: user.depotName,
        assignedDepots: user.assignedDepots || [],
        scope
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      userId: user._id,
      name: user.name,
      role: user.role,
      passwordChanged: user.passwordChanged || false,
      permissions: permissionsForRole(user.role),
      scope: { depotIds: scope.depotIds, districtId: scope.districtId || null },
      lastAcknowledgedCircularId: user.lastAcknowledgedCircularId,
      
      // Keep legacy for backward compatibility during transition
      districtName,
      depotName: user.depotName,
      assignedDepots: user.assignedDepots || []
    });

  } catch (err) {
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

