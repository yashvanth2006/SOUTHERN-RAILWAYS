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
  Trivandrum: [
    "TVC",
    "QLN",
    "KTYM",
    "ERN",
    "ERS",
    "TCR",
    "ALLP",
    "CGY",
    "TRVL",
    "CNGR",
    "KYJ",
    "NCJ"
  ],
  Trichy: [],
  Chennai: [
    "MAS",
    "MS",
    "TBM",
    "CGL",
    "AJJ",
    "TRL",
    "AVD",
    "VLCY",
    "PER",
    "RPM",
    "ENR",
    "GPD"
  ],
  Madurai: [
    "MDU",
    "DG",
    "TEN",
    "VPT",
    "MNM",
    "SCT",
    "TN",
    "RJPM",
    "KKDI",
    "PLNI",
    "TSI",
    "CVP"
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
