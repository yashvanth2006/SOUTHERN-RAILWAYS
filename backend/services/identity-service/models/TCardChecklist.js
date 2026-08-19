import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  description: String,
  checked: Boolean,
  remarks: String,
  priority: {
    type: String,
    enum: ["HIGH", "LOW", null],
    default: null
  },
  dieselLevel: {
    type: Number,
    default: null
  }
}, { _id: false });

const tCardChecklistSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  date: {
    type: Date,
    default: () => {
  const now = new Date();
  return new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ));
},
    index: true
  },

  tCarNo: {
    type: String,
    required: true
  },
  issue: {
    isIssue: Boolean,

    status: {
        type: String,
        default: "Pending"
    },

    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    resolvedAt: Date
},

  items: [checklistItemSchema]

}, { timestamps: true });

// Compound index for efficient queries by driver and date
tCardChecklistSchema.index({ driverId: 1, date: -1 });

export default mongoose.model("TCardChecklist", tCardChecklistSchema);
