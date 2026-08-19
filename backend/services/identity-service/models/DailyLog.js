import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  logDate: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    index: true
  },

  signInTime: Date,
  signOutTime: Date,
signInImage: {
    type: String,
    default: ""
},

signOutImage: {
    type: String,
    default: ""
},
  fromStation: String,
  toStation: String,

  twNumber: String,

  hours: Number,
  km: Number,
  mileage: Number,

  breathAnalyserDone: Boolean,
  breathAnalyserinitial: Boolean
}, { timestamps: true });

// Compound index for efficient queries by driver and date
dailyLogSchema.index({ driverId: 1, logDate: -1 });

export default mongoose.model("DailyLog", dailyLogSchema);
