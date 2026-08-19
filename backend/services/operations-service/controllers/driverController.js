import User from "../models/User.js";
import DriverProfile from "../models/DriverProfile.js";
import DailyLog from "../models/DailyLog.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import { getDistrictForDepot } from "../config/districtDepots.js";
import { getLRDepotsForDistrict } from "../config/lrDepots.js";

// import CompleteEngine from "../models/Engins.js"
/* ======================================================
    PROFILE
====================================================== */



const uploadImageToCloudinary = (file) => {

  return new Promise((resolve, reject) => {

    if (!file) return resolve("");

    const stream = cloudinary.uploader.upload_stream(

      {
        folder: "driver-breath-analyser",
        resource_type: "image"
      },

      (error, result) => {

        if (error) {

          reject(error);

        } else {

          resolve(result.secure_url);

        }

      }

    );

    streamifier.createReadStream(file.buffer).pipe(stream);

  });

};

/* VIEW OWN PROFILE */
export const getDriverProfile = async (req, res) => {
  const user = await User.findById(req.scope.userId)
    .select("name pfNo depotName");

  const profile = await DriverProfile.findOne({ userId: req.scope.userId });

  res.json({ user, profile });
};

/* UPDATE BIO DATA */
export const updateBioData = async (req, res) => {
  const {
    hrmsId,
    designation,
    basicPay,
    dateOfAppointment,
    dateOfEntryAsTWD
  } = req.body;

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.scope.userId },
    {
      hrmsId,
      designation,
      basicPay,
      dateOfAppointment,
      dateOfEntryAsTWD
    },
    { returnDocument: 'after', upsert: true }
  );

  res.json(updated);
};

/* ======================================================
   TRAINING (UPDATED TO NEW SCHEMA)
====================================================== */

/* UPDATE TRAININGS (PME / GRS_RC / TR4 / OC) */
export const updateTraining = async (req, res) => {
  const { trainings } = req.body;

  if (!trainings) {
    return res.status(400).json({ msg: "Training data missing" });
  }

  const updated = await DriverProfile.findOneAndUpdate(
    { userId: req.scope.userId },
    { $set: { trainings } },
    { returnDocument: 'after', upsert: true }
  );

  res.json({
    msg: "Training details updated successfully",
    trainings: updated.trainings
  });
};

/* ======================================================
   LR (NO SECTION)
====================================================== */

/* ======================================================
   LR – MULTIPLE ENTRIES
====================================================== */

export const updateLR = async (req, res) => {
  const { lrDetails } = req.body;

  if (
    !lrDetails?.section ||
    !lrDetails?.doneDate ||
    !lrDetails?.dueDate
  ) {
    return res.status(400).json({
      msg: "LR Section, Done Date and Due Date are mandatory"
    });
  }

  const [startStation, endStation] = lrDetails.section.split('-');

  if (startStation && endStation && startStation.trim() === endStation.trim()) {
    return res.status(400).json({
      msg: "Select a different depot."
    });
  }

  const user = await User.findById(req.scope.userId);
  if (user && user.depotName) {
    const district = getDistrictForDepot(user.depotName);
    const allowedDepots = getLRDepotsForDistrict(district);

    if (
      (startStation && !allowedDepots.includes(startStation.trim())) ||
      (endStation && !allowedDepots.includes(endStation.trim()))
    ) {
      return res.status(400).json({
        msg: "Invalid depot in section."
      });
    }
  }

  try {

    const profile = await DriverProfile.findOneAndUpdate(
      {
        userId: req.scope.userId
      },
      {},
      {
        returnDocument: 'after',
        upsert: true
      }
    );

    const existingIndex =
      profile.lrDetails.findIndex(
        lr =>
          lr.section.trim().toUpperCase() ===
          lrDetails.section.trim().toUpperCase()
      );

    if (existingIndex !== -1) {

      profile.lrDetails[existingIndex] = {
        ...profile.lrDetails[existingIndex].toObject(),
        ...lrDetails
      };

    } else {

      profile.lrDetails.push(lrDetails);

    }

    await profile.save();

    res.json({
      msg: "LR updated successfully",
      lrDetails: profile.lrDetails
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
}; 

/* GET ALL DEPOTS FOR DRIVER'S DISTRICT FOR LR */
export const getLRDepots = async (req, res) => {
  try {
    const user = await User.findById(req.scope.userId);
    if (!user || !user.depotName) {
      return res.json([]);
    }
    
    const district = getDistrictForDepot(user.depotName);
    if (!district) {
      return res.json([]);
    }

    const depots = getLRDepotsForDistrict(district);
    res.json(depots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


/* ======================================================
   DUTY LOG
====================================================== */

/* SIGN IN */
/* SIGN IN */
export const driverSignIn = async (req, res) => {
  try {

    const {
      fromStation,
      twNumber,
      breathAnalyserinitial
    } = req.body;

    if (!fromStation || !twNumber) {
      return res.status(400).json({
        msg: "Missing sign-in data"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await DailyLog.findOne({
      driverId: req.scope.userId,
      logDate: today,
      signOutTime: { $exists: false }
    });

    if (existing) {
      return res.status(400).json({
        msg: "Already signed in"
      });
    }

    /* ===============================
       Upload Image (Optional)
    =============================== */

    let signInImage = "";

    if (req.file) {

      signInImage = await uploadImageToCloudinary(req.file);

    }

    /* ===============================
       Save Log
    =============================== */

    await DailyLog.create({

      driverId: req.scope.userId,

      logDate: today,

      signInTime: new Date(),

      fromStation,

      twNumber,

      breathAnalyserinitial,

      signInImage

    });

    res.json({
      msg: "Signed in successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Server error"
    });

  }
};


/* SIGN OUT */
export const driverSignOut = async (req, res) => {
  try {

    const {
      toStation,
      km,
      breathAnalyserDone
    } = req.body;

    if (!toStation || !km) {
      return res.status(400).json({
        msg: "Missing sign-out data"
      });
    }

    const log = await DailyLog.findOne({
      driverId: req.scope.userId,
      signOutTime: { $exists: false }
    });

    if (!log) {
      return res.status(400).json({
        msg: "No active duty found"
      });
    }

    const signOutTime = new Date();

    const diffMs = signOutTime - log.signInTime;

    const hours = diffMs / (1000 * 60 * 60);

    /* ===============================
       Upload Image (Optional)
    =============================== */

    let signOutImage = "";

    if (req.file) {

      signOutImage = await uploadImageToCloudinary(req.file);

    }

    /* ===============================
       Save Details
    =============================== */

    log.signOutTime = signOutTime;

    log.toStation = toStation;

    log.km = Number(km);

    log.hours = Number(hours.toFixed(2));

    log.breathAnalyserDone = breathAnalyserDone;

    log.mileage = Number(km) * 5.94;

    log.signOutImage = signOutImage;

    await log.save();

    res.json({

      msg: "Signed out successfully",

      hours: log.hours

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Server error"
    });

  }
};


export const driverAlerts = async (req, res) => {
  const profile = await DriverProfile.findOne({ userId: req.scope.userId });
  const today = new Date();
  const alerts = [];

  /* TRAINING ALERTS */
  if (profile?.trainings) {
    Object.entries(profile.trainings).forEach(([key, value]) => {
      if (value?.dueDate && value.dueDate < today) {
        alerts.push({
          type: "TRAINING",
          message: `${key} training overdue`
        });
      }
    });
  }

  /* 🔥 LR ALERT – CHECK LATEST ENTRY */
  if (profile?.lrDetails?.length) {
    const latestLR = profile.lrDetails.at(-1);
    if (latestLR?.dueDate && latestLR.dueDate < today) {
      alerts.push({
        type: "LR",
        message: `LR overdue for ${latestLR.section}`
      });
    }
  }

  res.json(alerts);
};
/* ======================================================
   DUTY STATUS CHECKS
====================================================== */

/* CHECK ACTIVE DUTY */
export const checkActiveDuty = async (req, res) => {
  const activeLog = await DailyLog.findOne({
    driverId: req.scope.userId,
    signOutTime: null
  });

  res.json({ active: !!activeLog });
};

/* GET YESTERDAY DUTY STATUS */
export const getDutyStatus = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const log = await DailyLog.findOne({
    driverId: req.scope.userId,
    logDate: yesterday
  });

  if (!log) return res.json({ status: "NO_DUTY" });
  if (!log.signOutTime) return res.json({ status: "INCOMPLETE" });

  res.json({ status: "COMPLETED" });
};
