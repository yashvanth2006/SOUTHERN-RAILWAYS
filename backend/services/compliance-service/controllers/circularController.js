import cloudinary from "../utils/cloudinary.js";
import Circular from "../models/Circular.js";
import User from "../models/User.js";
import { userFilterFor } from "../services/authorization/scopeService.js";

export const uploadCircular = async (req, res) => {
  try {
    if (!req.file || !req.body.title || !req.body.circularDate) {
      return res.status(400).json({ message: "Title, Date and PDF required" });
    }

    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: "circulars",
      resource_type: "raw",
      access_mode: "public",
      use_filename: true,
      unique_filename: true,
    });

    const circular = await Circular.create({
      title: req.body.title,
      pdfUrl: result.secure_url,
      publicId: result.public_id,
      originalFilename: req.file.originalname,
      circularDate: new Date(req.body.circularDate) // ✅ SAVE DATE
    });

    res.status(201).json(circular);
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};

/* =======================
   GET ALL CIRCULARS
======================= */
export const getCirculars = async (req, res) => {
  try {

    const { date } = req.query;

    let filter = {};

    // ✅ Filter by specific date if provided
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.circularDate = { $gte: start, $lte: end };
    } 

    // ✅ Sort by circularDate instead of createdAt
    const circulars = await Circular.find(filter)
      .sort({ circularDate: -1 });

    res.json(circulars);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch circulars" });
  }
};

/* =======================
   STREAM PDF (VIEW / DOWNLOAD)
======================= */
export const getCircularPDF = async (req, res) => {
  const circular = await Circular.findById(req.params.id);

  if (!circular) {
    return res.status(404).json({ message: "Not found" });
  }

  // Force inline display
  res.setHeader("Content-Disposition", "inline");
  res.redirect(circular.pdfUrl);
};
export const acknowledgeCircular = async (req, res) => {
  try {
    const { id } = req.params;

    const circular = await Circular.findById(id);
    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    await User.findByIdAndUpdate(req.scope.userId, {
      lastAcknowledgedCircularId: id,
      lastAcknowledgedAt: new Date(),
    });

    res.json({
      msg: "Circular acknowledged successfully",
      circularId: id,
    });

  } catch (err) {
    console.error("Acknowledge failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCircularAcknowledgementReport = async (req, res) => {
  try {
    const { circularId } = req.query;

    if (!circularId) {
      return res.status(400).json({ msg: "Circular ID required" });
    }

    const circular = await Circular.findById(circularId);

    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    if (!req.scope || req.scope.role === "DRIVER") {
      return res.status(403).json({ msg: "Access denied" });
    }

    let allowedRoles = [];
    if (req.scope.role === "MANAGER") {
      allowedRoles = ["DRIVER"];
    } else if (req.scope.role === "MINI_ADMIN") {
      allowedRoles = ["DRIVER", "DEPOT_MANAGER"];
    } else {
      allowedRoles = ["DRIVER", "DEPOT_MANAGER", "ADEE"];
    }

    const filter = userFilterFor(req.scope);
    const userFilter = {
      ...filter,
      role: { $in: allowedRoles },
      status: "ACTIVE"
    };

    const users = await User.find(userFilter)
      .select(
        "name pfNo role depotName lastAcknowledgedCircularId lastAcknowledgedAt"
      );

    const reportUsers = users.map(user => {

      const acknowledged =
        user.lastAcknowledgedCircularId?.toString() ===
        circularId;

      return {

        _id: user._id,

        name: user.name,

        pfNo: user.pfNo,

        role: user.role,

        depotName: user.depotName,

        acknowledged,

        acknowledgedAt: acknowledged
          ? user.lastAcknowledgedAt
          : null

      };

    });

    const acknowledgedCount =
      reportUsers.filter(u => u.acknowledged).length;

    res.json({

      circular: {

        _id: circular._id,

        title: circular.title

      },

      summary: {

        total: reportUsers.length,

        acknowledged: acknowledgedCount,

        pending: reportUsers.length - acknowledgedCount,

        percentComplete:
          reportUsers.length === 0
            ? 0
            : Math.round(
                (acknowledgedCount /
                  reportUsers.length) * 100
              )

      },

      users: reportUsers

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Server error"
    });

  }
};

/* =======================
   DELETE CIRCULAR
======================= */
export const deleteCircular = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) {
      return res.status(404).json({ msg: "Circular not found" });
    }

    if (circular.publicId) {
      await cloudinary.uploader.destroy(circular.publicId);
    }

    await Circular.findByIdAndDelete(req.params.id);

    res.json({ msg: "Circular deleted successfully" });
  } catch (err) {
    console.error("Delete circular error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
