import Depot from "../models/Depot.js";
import {
  DISTRICT_NAMES,
  getAllSeedDepots,
  getDistrictForDepot,
  getSeedDepotsForDistrict
} from "../config/districtDepots.js";

export const normalizeDepotName = (depotName) => {
  return typeof depotName === "string" ? depotName.trim().toUpperCase() : "";
};

export const resolveUserDistrictName = (user) => {
  if (!user) return null;

  if (user.role === "MASTER_ADMIN" && user.districtOverrideName) {
    return user.districtOverrideName;
  }

  if (user.districtName) {
    return user.districtName;
  }

  if (user.role === "SUPER_ADMIN" && DISTRICT_NAMES.includes(user.depotName)) {
    return user.depotName;
  }

  const inferredDistrict = getDistrictForDepot(user.depotName);
  if (inferredDistrict) {
    return inferredDistrict;
  }

  if (user.role === "SUPER_ADMIN" && user.depotName === "HEADQUARTERS") {
    return "Salem";
  }

  return null;
};

export const getDepotsForDistrict = async (districtName) => {
  if (!districtName) return [];

  const depots = await Depot.distinct("name", { districtName });
  if (depots.length > 0) {
    return depots.map(normalizeDepotName).sort();
  }

  return getSeedDepotsForDistrict(districtName).slice().sort();
};

export const getAllKnownDepots = async () => {
  const depots = await Depot.distinct("name");
  if (depots.length > 0) {
    return depots.map(normalizeDepotName).sort();
  }

  return getAllSeedDepots().slice().sort();
};

export const getAllowedDepots = async (user) => {
  if (!user) return [];

  if (user.role === "MASTER_ADMIN") {
    if (user.districtOverrideName) {
      return getDepotsForDistrict(user.districtOverrideName);
    }
    return getAllKnownDepots();
  }

  const district = resolveUserDistrictName(user);
  if (district) {
    return getDepotsForDistrict(district);
  }

  return [];
};

export const getDepotNameFilter = async (user, requestedDepot) => {
  const normalizedRequestedDepot = normalizeDepotName(requestedDepot);

  if (user.role === "MASTER_ADMIN" && !user.districtOverrideName) {
    return normalizedRequestedDepot
      ? { filter: { depotName: normalizedRequestedDepot } }
      : { filter: {} };
  }

  const allowedDepots = await getAllowedDepots(user);

  if (normalizedRequestedDepot) {
    if (!allowedDepots.includes(normalizedRequestedDepot)) {
      return {
        error: {
          status: 403,
          msg: "Selected depot is outside your district scope"
        }
      };
    }

    return { filter: { depotName: normalizedRequestedDepot } };
  }

  return { filter: { depotName: { $in: allowedDepots } } };
};

export const getEngineDepotFilter = async (user, requestedDepot) => {
  const result = await getDepotNameFilter(user, requestedDepot);

  if (result.error) return result;
  if (!result.filter.depotName) return { filter: {} };

  return { filter: { depot: result.filter.depotName } };
};