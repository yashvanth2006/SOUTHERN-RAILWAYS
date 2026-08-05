// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pfNo: { type: String, unique: true, index: true }, // Primary identifier
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["DRIVER", "DEPOT_MANAGER", "SUPER_ADMIN","ADEE"],
    required: true,
    index: true
  },

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


}, { timestamps: true });

// Compound index for depot-based driver queries
userSchema.index({ role: 1, depotName: 1 });

export default mongoose.model("User", userSchema);
