import mongoose from "mongoose";

/* ===========================================
   TOWER CAR DETAILS
=========================================== */

const TowerCarSchema = new mongoose.Schema(
  {
    type: String,
    make: String,
    doc: Date,
  },
  { _id: false }
);

/* ===========================================
   BRAKE POWER
=========================================== */

const BrakePowerSchema = new mongoose.Schema(
  {
    issueDate: Date,
    dueDate: Date,
  },
  { _id: false }
);

/* ===========================================
   ENGINE
=========================================== */

const EngineSchema = new mongoose.Schema(
  {
    make: String,

    bCheckDate: Date,
    bCheckHours: Number,
    bCheckDueDate: Date,
    bCheckDueHours: Number,

    cCheckDate: Date,
    cCheckHours: Number,
    cCheckDueDate: Date,
    cCheckDueHours: Number,

    dCheckDate: Date,
    dCheckHours: Number,
    dCheckDueDate: Date,
    dCheckDueHours: Number,

    pohDate: Date,
    pohDueDate: Date,
    pohRemarks: String,
  },
  { _id: false }
);

/* ===========================================
   ULTRASONIC TESTING
=========================================== */

const UltrasonicSchema = new mongoose.Schema(
  {
    doneDate: Date,
    dueDate: Date,
  },
  { _id: false }
);

/* ===========================================
   HYDRAULIC OIL
=========================================== */

const HydraulicSchema = new mongoose.Schema(
  {
    changeDate: Date,

    currentHours: Number,

    dueHours: Number,
  },
  { _id: false }
);

/* ===========================================
   STARTING BATTERY
=========================================== */

const StartingBatterySchema = new mongoose.Schema(
  {
    make: String,

    commissionDate: Date,

    dueDate: Date,
  },
  { _id: false }
);

/* ===========================================
   LIGHTING BATTERY
=========================================== */

const LightingBatterySchema = new mongoose.Schema(
  {
    make: String,

    commissionDate: Date,

    dueDate: Date,
  },
  { _id: false }
);

/* ===========================================
   GENERATOR
=========================================== */

const GeneratorSchema = new mongoose.Schema(
  {
    make: String,

    serviceDate: Date,

    serviceHours: Number,

    dueHours: Number,
  },
  { _id: false }
);

/* ===========================================
   FAILURE HISTORY
=========================================== */

const FailureSchema = new mongoose.Schema(
  {
    component: String,

    description: String,

    failureDate: Date,
  },
  { _id: false }
);

/* ===========================================
   COMPLETE ENGINE
=========================================== */

const CompleteEngineSchema = new mongoose.Schema(
  {
    depot: {
      type: String,
      required: true,
      index: true,
    },

    towerCarNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    towerCar: TowerCarSchema,

    brakePower: BrakePowerSchema,

    engine: EngineSchema,

    ultrasonicTesting: UltrasonicSchema,

    hydraulicReplacement: HydraulicSchema,

    startingBattery: StartingBatterySchema,

    lightingBattery: LightingBatterySchema,

    generator: GeneratorSchema,

    failures: [FailureSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CompleteEngine",
  CompleteEngineSchema
);