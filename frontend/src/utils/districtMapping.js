export const districtAbbreviations = {
  Salem: "SA",
  Palakkad: "PGT",
  Trichy: "TPJ",
  Chennai: "MAS",
  Madurai: "MDU",
  Trivandrum: "TVC",
};

export const getDistrictAbbreviation = (districtName) => {
  if (!districtName) return "SR"; // Fallback to Southern Railway
  // Handle case insensitivity just in case
  const normalized = districtName.trim();
  for (const [key, value] of Object.entries(districtAbbreviations)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return value;
    }
  }
  return districtName; // If not found, just return the name itself
};
