export const LR_DEPOTS = {
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
    "CHSM",
    "PGT",
    "CBE",
    "POY",
    "MTP",
    "JTJ",
    "TPJ",
    "DG",
    "VRI",
    "KPM"
  ],
  Palakkad: [
    "PGT",
    "CAN",
    "KMQ",
    "PNMB",
    "CLT",
    "SRR",
    "PAY",
    "MAQ",
    "BDJ",
    "MHE",
    "PTJ",
    "ERS",
    "NIL",
    "POY",
    "KTU",
    "TCR",
    "PLL",
    "CBE",
    "UDT"
  ],
  Trivandrum: [],
  Trichy: [],
  Chennai: [],
  Madurai: []
};

export const getLRDepotsForDistrict = (districtName) => {
  return LR_DEPOTS[districtName] || [];
};
