export const rentalCategoryAliases = {
  "electronics-cameras": [
    "electronics-cameras",
    "electronics & cameras",
    "electronics",
    "cameras",
    "camera",
    "projectors",
    "drones",
  ],
  "cars-bikes": [
    "cars-bikes",
    "cars & bikes",
    "cars",
    "car",
    "bikes",
    "bike",
    "motorcycles",
    "motorcycle",
  ],
  "party-wedding": [
    "party-wedding",
    "party & wedding",
    "party",
    "wedding",
  ],
  "event-essentials": [
    "event-essentials",
    "event essentials",
    "event",
    "events",
  ],
  vehicles: [
    "vehicles",
    "vehicle",
    "suv",
    "pickup",
    "truck",
    "trucks",
    "van",
    "vans",
    "minibus",
    "minibuses",
  ],
  gadgets: ["gadgets", "gadget"],
  "construction-diy": [
    "construction-diy",
    "construction & diy",
    "construction",
    "diy",
    "tools",
    "tool",
  ],
  furniture: ["furniture"],
  "home-appliances": [
    "home-appliances",
    "home appliances",
    "appliances",
    "appliance",
  ],
  "sports-outdoor": [
    "sports-outdoor",
    "sports & outdoor",
    "sports",
    "outdoor",
  ],
  "travel-camping": [
    "travel-camping",
    "travel & camping",
    "travel",
    "camping",
  ],
  "fashion-accessories": [
    "fashion-accessories",
    "fashion & accessories",
    "fashion",
    "accessories",
  ],
  "music-audio": [
    "music-audio",
    "music & audio equipment",
    "music",
    "audio",
  ],
  "office-equipment": [
    "office-equipment",
    "office equipment",
    "office",
  ],
  "beauty-salon": [
    "beauty-salon",
    "beauty & salon equipment",
    "beauty",
    "salon",
  ],
  "baby-kids": [
    "baby-kids",
    "baby & kids essentials",
    "baby",
    "kids",
  ],
  "gaming-equipment": [
    "gaming-equipment",
    "gaming equipment",
    "gaming",
    "games",
  ],
};

export function normalizeCategoryToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRentalCategoryAliases(categoryId) {
  const aliases = rentalCategoryAliases[categoryId] || [categoryId];
  return new Set(aliases.map(normalizeCategoryToken).filter(Boolean));
}

export function listingMatchesRentalCategory(listing, categoryId) {
  if (!categoryId || categoryId === "all") return true;

  const aliases = getRentalCategoryAliases(categoryId);
  const categoryValues = [
    listing?.category,
    listing?.categoryName,
    listing?.categoryData?.id,
    listing?.categoryData?.slug,
    listing?.categoryData?.name,
  ]
    .map(normalizeCategoryToken)
    .filter(Boolean);

  return categoryValues.some((value) => aliases.has(value));
}
