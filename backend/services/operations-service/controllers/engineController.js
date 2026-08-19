import CompleteEngine from "../models/Engine.js";
import User from "../models/User.js";
import Depot from "../models/Depot.js";
import District from "../models/District.js";
import { isDepotInScope } from "../services/authorization/scopeService.js";
import { normalizeDepotName } from "../utils/accessScope.js";
import { getDistrictForDepot } from "../config/districtDepots.js";
import { getTowerWagonsForDistrict } from "../config/towerWagons.js";

export const createEngine = async (req, res) => {
  try {
    const {
      depot,
      towerCarNumber,
      towerCar,
      brakePower,
      engine,
      ultrasonicTesting,
      hydraulicReplacement,
      startingBattery,
      lightingBattery,
      generator,
      failures
    } = req.body;

    if (!depot || !towerCarNumber) {
      return res.status(400).json({ msg: "Depot and Tower Car Number are required." });
    }

    const normalizedDepot = normalizeDepotName(depot);
    const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
    if (!reqDepotDoc) {
      return res.status(400).json({ msg: "Invalid depot" });
    }

    const inScope = await isDepotInScope(req.scope, reqDepotDoc._id);
    if (!inScope) {
      return res.status(403).json({ msg: "Selected depot is outside your scope" });
    }

    const existing = await CompleteEngine.findOne({ towerCarNumber });

    if (existing) {
      return res.status(400).json({ msg: "Tower Car already exists." });
    }

    const newEngine = await CompleteEngine.create({
      depot: normalizedDepot,
      towerCarNumber,
      towerCar,
      brakePower,
      engine,
      ultrasonicTesting,
      hydraulicReplacement,
      startingBattery,
      lightingBattery,
      generator,
      failures
    });

    res.status(201).json({ msg: "Engine created successfully.", engine: newEngine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const getEnginesByDepot = async (req, res) => {
  try {
    const { depot } = req.query;
    let filter = {};

    if (depot) {
      const normalizedDepot = normalizeDepotName(depot);
      const reqDepotDoc = await Depot.findOne({ name: normalizedDepot, status: "ACTIVE" });
      if (!reqDepotDoc) return res.status(400).json({ msg: "Invalid depot" });

      const inScope = await isDepotInScope(req.scope, reqDepotDoc._id);
      if (!inScope) return res.status(403).json({ msg: "Selected depot is outside your scope" });

      filter.depot = normalizedDepot;
    } else {
      if (req.scope.depotIds !== "ALL") {
        const allowedDepotsDocs = await Depot.find({ _id: { $in: req.scope.depotIds } });
        const allowedDepotNames = allowedDepotsDocs.map(d => d.name);
        filter.depot = { $in: allowedDepotNames };
      }
    }

    const engines = await CompleteEngine.find(filter).sort({ depot: 1, towerCarNumber: 1 });
    res.json(engines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const getAvailableDepots = async (req, res) => {
  try {
    if (req.scope.depotIds === "ALL") {
      const all = await Depot.find({ status: "ACTIVE" }).select("name");
      return res.json(all.map(d => d.name));
    }
    const allowedDepotsDocs = await Depot.find({ _id: { $in: req.scope.depotIds } }).select("name");
    res.json(allowedDepotsDocs.map(d => d.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const getEngineById = async (req, res) => {
  try {
    const { id } = req.params;
    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({ msg: "Engine not found." });
    }

    const reqDepotDoc = await Depot.findOne({ name: normalizeDepotName(engine.depot) });
    if (!reqDepotDoc) return res.status(403).json({ msg: "Access denied to this depot" });

    const inScope = await isDepotInScope(req.scope, reqDepotDoc._id);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied to this depot" });
    }

    res.json(engine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const updateEngine = async (req, res) => {
  try {
    const { id } = req.params;
    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({ msg: "Engine not found." });
    }

    const reqDepotDoc = await Depot.findOne({ name: normalizeDepotName(engine.depot) });
    if (!reqDepotDoc) return res.status(403).json({ msg: "Access denied to this depot" });

    const inScope = await isDepotInScope(req.scope, reqDepotDoc._id);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied to this depot" });
    }

    if (req.body.depot) {
      req.body.depot = normalizeDepotName(req.body.depot);
      const newDepotDoc = await Depot.findOne({ name: req.body.depot });
      if (!newDepotDoc) return res.status(400).json({ msg: "Invalid target depot" });
      const newInScope = await isDepotInScope(req.scope, newDepotDoc._id);
      if (!newInScope) {
        return res.status(403).json({ msg: "Selected depot is outside your district scope" });
      }
    }

    Object.assign(engine, req.body);
    await engine.save();

    res.json({ msg: "Engine updated successfully.", engine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const deleteEngine = async (req, res) => {
  try {
    const { id } = req.params;
    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({ msg: "Engine not found." });
    }

    const reqDepotDoc = await Depot.findOne({ name: normalizeDepotName(engine.depot) });
    if (!reqDepotDoc) return res.status(403).json({ msg: "Access denied to this depot" });

    const inScope = await isDepotInScope(req.scope, reqDepotDoc._id);
    if (!inScope) {
      return res.status(403).json({ msg: "Access denied to this depot" });
    }

    await CompleteEngine.findByIdAndDelete(id);

    res.json({ msg: "Engine deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

export const getTowerWagonList = async (req, res) => {
  try {
    const user = await User.findById(req.scope.userId);
    let districtName = user.districtName;

    if (!districtName && user.depotName) {
      districtName = getDistrictForDepot(user.depotName);
    }

    if (!districtName) {
      return res.json([]);
    }

    const towerWagons = getTowerWagonsForDistrict(districtName);
    
    // Add LR and TRAINING as standard options for drivers
    const finalOptions = [...towerWagons, "LR", "TRAINING"];
    
    res.json(finalOptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
