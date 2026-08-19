import mongoose from "mongoose";

/* ================= TRAINING SUB-SCHEMA ================= */
const trainingItemSchema = new mongoose.Schema({
  doneDate: Date,
  dueDate: Date,
  schedule: String
}, { _id: false });

/* ================= LR SUB-SCHEMA ================= */
const lrItemSchema = new mongoose.Schema({
  section: String,
  doneDate: Date,
  dueDate: Date,
  schedule: String 
}, { _id: false });

/* ================= DRIVER PROFILE ================= */
const driverProfileSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  hrmsId: {
    type: String,
    required: true
  },

  designation: String,
  basicPay: Number,

  dateOfAppointment: Date,
  dateOfEntryAsTWD: Date,

  /* 🔥 MULTI TRAININGS */
  trainings: {
    PME: trainingItemSchema,
    GRS_RC: trainingItemSchema,
    TR4: trainingItemSchema,
    OC: trainingItemSchema
  },

  /* 🔥 MULTIPLE LR ENTRIES */
  lrDetails: [lrItemSchema]

}, { timestamps: true });

export default mongoose.model("DriverProfile", driverProfileSchema);
