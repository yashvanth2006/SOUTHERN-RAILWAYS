import mongoose from "mongoose";

const abnormalityItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  {
    _id: false
  }
);

const abnormalitySchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    depotName: {
      type: String,
      required: true
    },

    towerCarNo: {
      type: String,
      required: true
    },

    abnormalities: [abnormalityItemSchema],

    status: {
      type: String,
      enum: ["Pending", "Action Taken"],
      default: "Pending"
    },

    actionTaken: {
      type: String,
      default: ""
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    resolvedAt: Date
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Abnormality",
  abnormalitySchema
);