/**
 * Circular Acknowledgement Middleware
 *
 * This middleware checks if a user has acknowledged the latest circular.
 * It blocks access to protected routes if acknowledgement is pending.
 *
 * Exempted routes:
 * - /auth/* (login/register)
 * - /admin/circulars/* (circular operations)
 *
 * @module middleware/circularAck
 */

import Circular from "../models/Circular.js";
import User from "../models/User.js";

/**
 * Middleware to enforce circular acknowledgement
 * Returns 403 if user has not acknowledged the latest circular
 */
export const requireCircularAcknowledgement = async (req, res, next) => {
  try {
    // Get the latest circular
    const latestCircular = await Circular.findOne()
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    // No circulars exist - allow access
    if (!latestCircular) {
      return next();
    }

    // Get user's acknowledgement status
    const user = await User.findById(req.user.id)
      .select("lastAcknowledgedCircularId")
      .lean();

    // Check if acknowledged
    const acknowledged = user.lastAcknowledgedCircularId &&
      user.lastAcknowledgedCircularId.toString() === latestCircular._id.toString();

    if (!acknowledged) {
      return res.status(403).json({
        msg: "Circular acknowledgement required",
        code: "CIRCULAR_ACK_REQUIRED",
        latestCircularId: latestCircular._id
      });
    }

    next();

  } catch (err) {
    console.error("Circular acknowledgement check failed:", err.message);
    res.status(500).json({ msg: "Server error during acknowledgement check" });
  }
};

export default { requireCircularAcknowledgement };

