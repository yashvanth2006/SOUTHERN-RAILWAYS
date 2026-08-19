// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pfNo: { type: String, unique: true, index: true }, // Primary identifier
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN", "ADEE", "MASTER_ADMIN"],
    required: true,
    index: true
  },

  districtName: { type: String, index: true },

  depotName: { type: String, index: true }, // for depot-based filtering

  /**
   * First-Login Password Change Tracking
   * Default is false - user must change password on first login
   * Set to true after password change
   */
  passwordChanged: {
    type: Boolean,
    default: false
  },

  /**
   * Circular Acknowledgement Tracking (Lightweight)
   * Stores the ID of the last circular acknowledged by this user.
   * Used to enforce mandatory circular reading before dashboard access.
   */
  lastAcknowledgedCircularId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Circular",
    default: null
  },
  assignedDepots: [
  {
    type: String
  }
],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  // =========================================================
  // MODULE 2 — Explicit User Hierarchy (additive, do not remove above fields)
  // =========================================================

  /**
   * parentUserId: The direct organizational parent of this user.
   * Chain: SUPER_ADMIN(null) → MINI_ADMIN → MANAGER → DRIVER
   * DISTRICT_ADMIN also points to SUPER_ADMIN (parallel scope tier).
   * NOT populated during registration — backfilled by backfillUserHierarchy.js
   */
  parentUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    default: null
  },

  /**
   * depotId: Canonical ObjectId reference to the Depot collection.
   * Set for MANAGER and DRIVER roles.
   * MINI_ADMIN uses assignedDepotIds instead (multiple depots).
   */
  depotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Depot",
    index: true,
    default: null
  },

  /**
   * assignedDepotIds: Canonical ObjectId references for MINI_ADMIN (ADEE).
   * Mirrors the legacy assignedDepots[] string array.
   * assignedDepots[] is preserved (NOT removed).
   */
  assignedDepotIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Depot"
  }],

  /**
   * districtId: Canonical ObjectId reference to the District collection.
   * Set for DISTRICT_ADMIN (district-scoped SUPER_ADMIN) and MINI_ADMIN.
   */
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    index: true,
    default: null
  },

  /**
   * status: User lifecycle state.
   * ACTIVE = normal, INACTIVE = soft-deleted, SUSPENDED = temporarily disabled.
   * Default ACTIVE so all existing users remain accessible after migration.
   */
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE"
  }

}, { timestamps: true });

// Compound index for depot-based driver queries
userSchema.index({ role: 1, districtName: 1 });
userSchema.index({ role: 1, depotName: 1 });

// Module 2 — New compound indexes (mirrors existing string-field indexes for the ID-based fields)
userSchema.index({ role: 1, depotId: 1 });
userSchema.index({ role: 1, districtId: 1 });

export default mongoose.model("User", userSchema);
