import mongoose from "mongoose";

/**
 * Canonical Depot Model — Module 1 (Architecture Migration)
 *
 * Extended with:
 *   - districtId: ObjectId reference to the District collection (canonical, replaces districtName string)
 *   - code:       Short uppercase code for the depot (same as name for now — unique identifier)
 *   - status:     ACTIVE/INACTIVE lifecycle flag
 *
 * Preserved (additive only — not removed per Module 1 constraints):
 *   - districtName: Legacy string field. Kept for backward compatibility during migration.
 *                   Will be removed in a later cleanup phase after full dual-write validation.
 *
 * NOTE ON UNIQUE INDEXES:
 *   The unique constraints on `name` and `code` enforce canonical identity.
 *   The old compound index { name, districtName, unique:true } is replaced by unique on name alone,
 *   because the whole point of this migration is that two records with the same name but different
 *   districtName strings (a data-integrity bug) should be impossible.
 *   IMPORTANT: Do NOT add unique:true to name/code until backfillDepots.js dry-run shows zero
 *   unresolved depots and zero duplicate collisions against real data.
 */
const depotSchema = new mongoose.Schema(
  {
    // --- Existing fields (preserved, do not remove) ---
    name: {
      type: String,
      required: true,
      unique: true,       // Module 1: replaces old compound unique; safe after dry-run confirms no duplicates
      trim: true,
      uppercase: true,
      index: true
    },
    districtName: {
      type: String,
      trim: true,
      index: true
      // NOTE: `required: true` removed — legacy field, may be absent on new documents going forward
    },

    // --- New canonical fields (Module 1, additive) ---
    code: {
      type: String,
      required: true,
      unique: true,       // Must be unique — same guarantee as name
      trim: true,
      uppercase: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Depot", depotSchema);
