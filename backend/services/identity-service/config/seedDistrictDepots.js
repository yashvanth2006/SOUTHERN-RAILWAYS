import mongoose from "mongoose";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";

if (process.env.NODE_ENV === "development") {
  delete process.env.MONGO_URI;
}

dotenv.config({ path: envFile, override: true });

import User from "../models/User.js";
import District from "../models/District.js";
import Depot from "../models/Depot.js";
import { DISTRICT_DEPOTS, getDistrictForDepot } from "./districtDepots.js";

const seedDistrictDepots = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nSeeding district and depot records...\n");

    for (const [districtName, depots] of Object.entries(DISTRICT_DEPOTS)) {
      const districtDoc = await District.findOneAndUpdate(
        { name: districtName },
        { $setOnInsert: { name: districtName } },
        { upsert: true, new: true }
      );

      for (const depotName of depots) {
        await Depot.updateOne(
          { name: depotName, districtName },
          { $set: { code: depotName, districtId: districtDoc._id } },
          { upsert: true }
        );
      }

      console.log(`${districtName}: ${depots.length} depots ready`);
    }

    const users = await User.find({});
    let updatedUsers = 0;

    for (const user of users) {
      let districtName = user.districtName;

      if (!districtName && user.role === "SUPER_ADMIN" && DISTRICT_DEPOTS[user.depotName]) {
        districtName = user.depotName;
      }

      if (!districtName && user.role === "SUPER_ADMIN" && user.depotName === "HEADQUARTERS") {
        districtName = "Salem";
      }

      if (!districtName) {
        districtName = getDistrictForDepot(user.depotName);
      }

      if (!districtName && user.assignedDepots?.length) {
        districtName = getDistrictForDepot(user.assignedDepots[0]);
      }

      if (districtName && user.districtName !== districtName) {
        user.districtName = districtName;
        await user.save();
        updatedUsers++;
      }
    }

    console.log(`Users backfilled: ${updatedUsers}`);
    console.log("\nDistrict/depot seed complete.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("District/depot seed failed:", err.message);
    process.exit(1);
  }
};

seedDistrictDepots();
