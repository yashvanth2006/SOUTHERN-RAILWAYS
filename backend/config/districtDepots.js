export const DISTRICT_DEPOTS = {
  Salem: [
    "SLY",
    "BQI",
    "MTDM",
    "SA",
    "ED",
    "TUP",
    "PTJ",
    "KMD",
    "KRR",
    "PLI",
    "NMKL",
    "CHSM"
  ],
  Palakkad: [
    "ULL",
    "CHV",
    "CS",
    "QLD",
    "TIR",
    "PGT",
    "SRR",
    "POY",
    "NIL",
    "CAN"
  ],
  Trivandrum: [],
  Trichy: [],
  Chennai: [],
  Madurai: [
    "MPA",
    "DG",
    "MDU",
    "VPT",
    "CVP",
    "TEN",
    "MNM",
    "KKDI",
    "SCT",
    "PUU",
    "RMD",
    "TN",
    "RJPM",
    "NZT",
    "PLNI",
    "ASD"
  ]
};

export const DISTRICT_NAMES = Object.keys(DISTRICT_DEPOTS);

export const getDistrictForDepot = (depotName) => {
  if (!depotName) return null;

  const normalizedDepot = depotName.trim().toUpperCase();

  for (const [districtName, depots] of Object.entries(DISTRICT_DEPOTS)) {
    if (depots.includes(normalizedDepot)) {
      return districtName;
    }
  }

  return null;
};

export const getSeedDepotsForDistrict = (districtName) => {
  return DISTRICT_DEPOTS[districtName] || [];
};

export const getAllSeedDepots = () => {
  return Object.values(DISTRICT_DEPOTS).flat();
};
