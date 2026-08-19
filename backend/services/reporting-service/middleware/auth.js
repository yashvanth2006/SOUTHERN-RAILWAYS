// middleware/auth.js
import jwt from "jsonwebtoken";

import District from "../models/District.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (user.role === "MASTER_ADMIN" && req.headers["x-district-id"]) {
      try {
        const overrideVal = req.headers["x-district-id"];
        let dist;
        // Check if it's a valid MongoDB ObjectId
        if (overrideVal.match(/^[0-9a-fA-F]{24}$/)) {
          dist = await District.findById(overrideVal);
        } else {
          // Fallback if localStorage still has the old string name
          dist = await District.findOne({ name: overrideVal });
        }
        
        if (dist) {
          user.districtOverrideName = dist.name;
        }
      } catch (dbErr) {
        console.error("District override lookup error:", dbErr);
      }
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ msg: "Access denied" });
    next();
  };
};

