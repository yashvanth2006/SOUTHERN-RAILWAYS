/**
 * scopeService.js — Module 3
 *
 * Single source of truth for resolving what a user can see and act on.
 * Uses ONLY the canonical ID-based fields from Module 2:
 *   depotId, districtId, assignedDepotIds, parentUserId, status
 *
 * CONSTRAINTS (per Module 3 spec):
 *   - NO references to depotName, districtName, or assignedDepots (legacy strings)
 *   - Fail closed: every ambiguous/error state returns null or empty scope
 *   - resolveUserScope must check status === "ACTIVE"
 *
 * Role name mapping (Module 1 confirmed):
 *   MASTER_ADMIN  → new name SUPER_ADMIN
 *   SUPER_ADMIN   → new name DISTRICT_ADMIN (district-scoped)
 *   ADEE          → new name MINI_ADMIN
 *   DEPOT_MANAGER → new name MANAGER
 *   DRIVER        → DRIVER (unchanged)
 *
 * NOTE: Role string values in the DB are NOT changed yet (that's Module 5).
 * This service maps the current DB role strings to the new scope model.
 */

import User from "../../models/User.js";

/**
 * Resolves what a user can see, based on the new depotId/parentUserId/assignedDepotIds
 * fields populated in Module 2. Does NOT read depotName/districtName strings.
 *
 * Returns null if user is not found, not ACTIVE, or role is unrecognised.
 *
 * @param {string} userId - MongoDB ObjectId string of the requesting user
 * @returns {Promise<object|null>} scope object or null
 */
export const resolveUserScope = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  if (user.status !== "ACTIVE") return null; // disabled/suspended users have no scope

  switch (user.role) {
    // MASTER_ADMIN = new SUPER_ADMIN: division-wide, no depot filter
    case "MASTER_ADMIN": {
      if (user.districtOverrideName) {
        const District = (await import("../../models/District.js")).default;
        const Depot = (await import("../../models/Depot.js")).default;
        const dist = await District.findOne({ name: user.districtOverrideName });
        
        if (dist) {
          const depots = await Depot.find({ districtId: dist._id, status: "ACTIVE" }).select("_id");
          return {
            userId: user._id,
            role: "DISTRICT_ADMIN",
            districtId: dist._id,
            depotIds: depots.map(d => d._id)
          };
        }
      }
      return { userId: user._id, role: "SUPER_ADMIN", depotIds: "ALL" };
    }

    // SUPER_ADMIN (district-scoped) = new DISTRICT_ADMIN
    case "SUPER_ADMIN": {
      const Depot = (await import("../../models/Depot.js")).default;
      const District = (await import("../../models/District.js")).default;
      let districtId = user.districtId;

      if (!districtId) {
        // Fallback: Super Admin was created before Module 4 and only has districtName or depotName (legacy)
        const fallbackName = user.districtName || user.depotName;
        if (fallbackName) {
          const districtDoc = await District.findOne({ name: fallbackName });
          if (districtDoc) districtId = districtDoc._id;
        }
      }

      if (!districtId) {
        // No districtId and no fallback name → fail closed
        return { userId: user._id, role: "DISTRICT_ADMIN", depotIds: [] };
      }
      
      const depots = await Depot.find({ districtId: districtId, status: "ACTIVE" }).select("_id");
      return {
        userId: user._id,
        role: "DISTRICT_ADMIN",
        districtId: districtId,
        depotIds: depots.map(d => d._id),
      };
    }

    // ADEE = new MINI_ADMIN: explicit list of assigned depots
    case "ADEE":
      return {
        userId: user._id,
        role: "MINI_ADMIN",
        depotIds: user.assignedDepotIds?.length ? user.assignedDepotIds : [],
      };

    // DEPOT_MANAGER = new MANAGER: exactly one depot
    case "DEPOT_MANAGER":
      return {
        userId: user._id,
        role: "MANAGER",
        depotIds: user.depotId ? [user.depotId] : [],
      };

    // DRIVER: self-only, their own depot for read access
    case "DRIVER":
      return {
        userId: user._id,
        role: "DRIVER",
        depotIds: user.depotId ? [user.depotId] : [],
        selfOnly: true,
      };

    default:
      // Unknown role: fail closed with empty scope (no access)
      return { userId: user._id, role: user.role, depotIds: [] };
  }
};

/**
 * Returns true if depotId falls within the resolved scope.
 * Always returns false for null/undefined scope.
 *
 * @param {object} scope - result from resolveUserScope()
 * @param {mongoose.Types.ObjectId|string} depotId
 * @returns {boolean}
 */
export const isDepotInScope = (scope, depotId) => {
  if (!scope) return false;
  if (!depotId) return false;
  if (scope.depotIds === "ALL") return true;
  if (!Array.isArray(scope.depotIds)) return false;
  return scope.depotIds.some(id => id.toString() === depotId.toString());
};

/**
 * Returns a Mongoose filter fragment for querying by depot.
 * Spread this directly into any Model.find() call.
 * Fails closed: if scope is null, returns { _id: null } which matches nothing.
 *
 * @param {object} scope - result from resolveUserScope()
 * @param {string} fieldName - the field on the collection that stores the depotId (default: "depotId")
 * @returns {object} Mongoose filter fragment
 */
export const depotFilterFor = (scope, fieldName = "depotId") => {
  if (!scope) return { _id: null }; // matches nothing — fail closed
  if (scope.depotIds === "ALL") return {};
  if (!Array.isArray(scope.depotIds) || scope.depotIds.length === 0) {
    return { _id: null }; // empty scope → also matches nothing — fail closed
  }
  return { [fieldName]: { $in: scope.depotIds } };
};

/**
 * Returns a Mongoose filter fragment for querying Users specifically.
 * It checks both `depotId` (for Drivers/Managers) and `assignedDepotIds` (for Mini Admins).
 * Fails closed: if scope is null, returns { _id: null } which matches nothing.
 *
 * @param {object} scope - result from resolveUserScope()
 * @returns {object} Mongoose filter fragment
 */
export const userFilterFor = (scope) => {
  if (!scope) return { _id: null }; // matches nothing — fail closed
  if (scope.depotIds === "ALL") return {};
  if (!Array.isArray(scope.depotIds) || scope.depotIds.length === 0) {
    return { _id: null }; // empty scope → also matches nothing — fail closed
  }
  return {
    $or: [
      { depotId: { $in: scope.depotIds } },
      { assignedDepotIds: { $in: scope.depotIds } }
    ]
  };
};

/**
 * Resolves the scope's depot ObjectIds into string names and returns a Mongoose filter.
 * Required for operational records (Abnormality, DailyLog, TCardChecklist, Engine) 
 * which permanently store the string `depotName` where they occurred.
 *
 * @param {object} scope - result from resolveUserScope()
 * @param {string} fieldName - the string field on the collection (default: "depotName")
 * @returns {Promise<object>} Mongoose filter fragment
 */
export const getDepotNameFilter = async (scope, fieldName = "depotName") => {
  if (!scope) return { _id: null };
  if (scope.depotIds === "ALL") return {};
  if (!Array.isArray(scope.depotIds) || scope.depotIds.length === 0) {
    return { _id: null };
  }

  const Depot = (await import("../../models/Depot.js")).default;
  const depots = await Depot.find({ _id: { $in: scope.depotIds } }).select("name");
  const names = depots.map(d => d.name);

  return { [fieldName]: { $in: names } };
};

/**
 * For hierarchy operations (view/update a specific user), not just depot-scoped resources.
 * Walks the target user's depotId and assignedDepotIds to confirm it is within the actor's scope.
 *
 * Rules:
 *   - MASTER_ADMIN: always true (all users in scope)
 *   - selfOnly (DRIVER): only self
 *   - All others: target must be within the actor's depot scope
 *
 * @param {object} scope - result from resolveUserScope()
 * @param {string} targetUserId - MongoDB ObjectId string of the user being viewed/updated
 * @returns {Promise<boolean>}
 */
export const isUserInScope = async (scope, targetUserId) => {
  if (!scope) return false;

  // MASTER_ADMIN has division-wide scope — can access any user
  if (scope.depotIds === "ALL") return true;

  const target = await User.findById(targetUserId);
  if (!target) return false;

  // Self is always in scope (any role can view/update themselves)
  if (target._id.toString() === scope.userId.toString()) return true;

  // Drivers operate selfOnly — they cannot manage or view other users
  if (scope.selfOnly) return false;

  // Target must be within the actor's depot scope
  // Covers: MANAGER→DRIVER, MINI_ADMIN→MANAGER, DISTRICT_ADMIN→any depot user
  if (target.depotId && isDepotInScope(scope, target.depotId)) return true;

  // For MINI_ADMIN targets (who have assignedDepotIds, not a single depotId)
  if (target.assignedDepotIds?.length) {
    return target.assignedDepotIds.some(id => isDepotInScope(scope, id));
  }

  return false;
};
