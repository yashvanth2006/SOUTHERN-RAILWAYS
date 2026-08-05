import CompleteEngine from "../models/Engine.js";



export const createEngine = async (req, res) => {
  try {

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        msg: "Only Super Admin can create engines."
      });
    }

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
      return res.status(400).json({
        msg: "Depot and Tower Car Number are required."
      });
    }

    const existing = await CompleteEngine.findOne({
      towerCarNumber
    });

    if (existing) {
      return res.status(400).json({
        msg: "Tower Car already exists."
      });
    }

    const newEngine = await CompleteEngine.create({

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

    });

    res.status(201).json({
      msg: "Engine created successfully.",
      engine: newEngine
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};


export const getEnginesByDepot = async (req, res) => {
  try {
    const { depot } = req.query;

    let filter = {};

    /* ======================================
       DEFAULT VIEW BASED ON ROLE
    ====================================== */

    if (!depot) {

      if (req.user.role === "SUPER_ADMIN") {

        // Super Admin sees all depots
        filter = {};

      } else if (req.user.role === "ADEE") {

        // ADEE sees only his assigned depots by default
        filter = {
          depot: {
            $in: req.user.assignedDepots || []
          }
        };

      } else {

        // Driver & Depot Manager
        filter = {
          depot: req.user.depotName
        };

      }

    } else {

      // User selected a depot from dropdown
      filter = {
        depot
      };

    }

 const engines = await CompleteEngine.find(filter)
.sort({
  depot: 1,
  towerCarNumber: 1
});

    res.json(engines);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};


export const getAvailableDepots = async (req, res) => {
  try {

    const depots = await CompleteEngine.distinct("depot");

    depots.sort();

    res.json(depots);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};


export const getEngineById = async (req, res) => {
  try {

    const { id } = req.params;

    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({
        msg: "Engine not found."
      });
    }

    res.json(engine);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};

export const updateEngine = async (req, res) => {
  try {

    const { id } = req.params;

    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({
        msg: "Engine not found."
      });
    }

    /* ===========================================
       ROLE PERMISSION CHECK
    =========================================== */

    // Super Admin can edit everything

    if (req.user.role !== "SUPER_ADMIN") {

      // Only Depot Manager can edit

      if (req.user.role !== "DEPOT_MANAGER") {
        return res.status(403).json({
          msg: "You don't have permission to edit."
        });
      }

      // Depot Manager can edit ONLY his depot

      if (engine.depot !== req.user.depotName) {
        return res.status(403).json({
          msg: "You can edit only your own depot engines."
        });
      }

    }

    /* ===========================================
       UPDATE
    =========================================== */

    Object.assign(engine, req.body);

    await engine.save();

    res.json({
      msg: "Engine updated successfully.",
      engine
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};


export const deleteEngine = async (req, res) => {
  try {

    const { id } = req.params;

    // Only Super Admin can delete
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        msg: "Only Super Admin can delete engine records."
      });
    }

    const engine = await CompleteEngine.findById(id);

    if (!engine) {
      return res.status(404).json({
        msg: "Engine not found."
      });
    }

    await CompleteEngine.findByIdAndDelete(id);

    res.json({
      msg: "Engine deleted successfully."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: err.message
    });

  }
};