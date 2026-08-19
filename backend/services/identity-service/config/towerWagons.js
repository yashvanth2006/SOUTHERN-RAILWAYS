export const TOWER_WAGONS = {
  Salem: [
    "RU 927/017",
    "SR 220035",
    "SR 210018",
    "SR 960025",
    "SR 23025",
    "SR 240063",
    "RU 06878",
    "SR 230022",
    "SR 210067",
    "RU 01896",
    "RU 176019",
    "SR 230059",
    "RU 9516",
    "RU 9514",
    "RU 9496",
    "RU 950021"
  ],
  Palakkad: [
    "RVNL-18037",
    "SR 190049",
    "SR-210049",
    "RU 17877",
    "PTL 2011030045",
    "RU 17878",
    "SR 210080",
    "SR 230066",
    "SR 9505",
    "PTL 12898",
    "SR 200074"
  ],
  Trivandrum: [],
  Trichy: [],
  Chennai: [],
  Madurai: []
};

export const getTowerWagonsForDistrict = (districtName) => {
  return TOWER_WAGONS[districtName] || [];
};
