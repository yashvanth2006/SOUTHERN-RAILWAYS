import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("District", districtSchema);
