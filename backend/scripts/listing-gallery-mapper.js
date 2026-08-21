const path = require("path");
const curatedLibrary = require("../data/curated-image-library.json");

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (value) =>
  normalize(value).replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const rootDir = path.resolve(__dirname, "..", "..");
const asset = (file) =>
  path.join(rootDir, "frontend", "src", "assets", "images", file);

const fixedTitles = new Set(Object.keys(curatedLibrary));
const fixedGalleryUrls = Object.fromEntries(
  Object.entries(curatedLibrary).map(([title, entry]) => [
    title,
    (entry.images || []).map((image) => image.url),
  ]),
);

const galleries = {
  carSedan: [
    path.join(
      rootDir,
      "backend",
      "uploads",
      "listings",
      "raw",
      "toyota-corolla-0-259bbe.jpeg",
    ),
  ],
  pickup: [asset("vehford.png")],
  suv: [asset("vehsvu.png")],
  van: [asset("toyota_rav4_2023_1781969002285.png")],
  truck: [asset("vehford.png")],
  dslr: [asset("canon_dslr_kit_1781969013603.png")],
  mirrorless: [asset("catagsony.png")],
  projector: [asset("projector.png")],
  speaker: [asset("electrospkear.png")],
  generator: [asset("waterpp.png")],
  tent: [
    path.join(
      rootDir,
      "backend",
      "uploads",
      "listings",
      "raw",
      "wedding-tent-0-b48f74.jpeg",
    ),
  ],
  stage: [asset("party_wedding_chairs.jpg")],
  tableSet: [asset("furndinning.png")],
  chairsSet: [asset("party_wedding_chairs.jpg")],
  barrier: [asset("party_wedding_chairs.jpg")],
  chairs: [asset("furnchair.png")],
  lighting: [asset("4k_projector_1781969048940.png")],
  cable: [asset("media__1781906876402.png")],
  redCarpet: [asset("fashion_evening_dress.jpg")],
  mixer: [asset("electrospkear.png")],
  drill: [asset("dewalt.png")],
  saw: [asset("toolsaw.png")],
  pressureWasher: [asset("pressure_washer_1781969060604.png")],
  scaffold: [asset("dewalt_drill_set_1781969024967.png")],
  compressor: [asset("dewalt.png")],
  stroller: [asset("media__1781932429937.png")],
  crib: [asset("media__1781939577528.png")],
  carSeat: [asset("media__1781906876402.png")],
  walker: [asset("media__1781932429937.png")],
  highChair: [asset("party_wedding_chairs.jpg")],
  playpen: [asset("media__1781939577528.png")],
  barberChair: [asset("beauty_salon_station.jpg")],
  stylingChair: [asset("beauty_salon_station.jpg")],
  facialSteamer: [asset("beauty_salon_station.jpg")],
  hairDryer: [asset("beauty_salon_station.jpg")],
  massageBed: [asset("beauty_salon_station.jpg")],
  waxHeater: [asset("beauty_salon_station.jpg")],
  sofa: [asset("furnsofa.png")],
  diningTable: [asset("furndinning.png")],
  desk: [asset("furndesk.png")],
  officeChair: [asset("furnchair.png")],
  wardrobe: [asset("furnshelf.png")],
  conferenceTable: [asset("furndinning.png")],
  fridge: [asset("electrotv.png")],
  washer: [asset("media__1781906876402.png")],
  freezer: [asset("electrotv.png")],
  microwave: [asset("pc.png")],
  waterDispenser: [asset("waterpp.png")],
  vacuum: [asset("electrotv.png")],
  printer: [asset("pc.png")],
  copier: [asset("pc.png")],
  projectorScreen: [asset("4k_projector_1781969048940.png")],
  whiteboard: [asset("media__1781939577528.png")],
  bike: [asset("sportbick.png")],
  campingTent: [asset("sportpandel.png")],
  football: [asset("sportgolf.png")],
  treadmill: [asset("sportclim.png")],
  campingChair: [asset("party_wedding_chairs.jpg")],
  grill: [asset("sportclim.png")],
  sleepingBag: [asset("sportpandel.png")],
  backpack: [asset("hero_camera.png")],
  stove: [asset("toolorbit.png")],
  cooler: [
    path.join(
      rootDir,
      "backend",
      "uploads",
      "listings",
      "raw",
      "wedding-tent-0-b48f74.jpeg",
    ),
  ],
  lantern: [asset("hero_electronics.png")],
  ps5: [asset("gadgets_ps5_vr.jpg")],
  xbox: [asset("electroheadset.png")],
  switch: [asset("gadgets_ps5_vr.jpg")],
  gamingChair: [asset("furnchair.png")],
  vr: [asset("gadgets_ps5_vr.jpg")],
  monitor: [asset("electrotv.png")],
  gamingLaptop: [asset("gaming_laptop_1781969037627.png")],
  fashionDress: [asset("fashion_evening_dress.jpg")],
  fashionSuit: [asset("fashion_evening_dress.jpg")],
  accessoryKit: [asset("hero_camera.png")],
};

function resolveGalleryKey(listing) {
  const title = normalize(listing.title);
  const category = normalize(listing.category?.slug);

  if (title.includes("generator")) return "generator";
  if (title.includes("mixer")) return "mixer";
  if (title.includes("drill")) return "drill";
  if (title.includes("projector")) return "projector";
  if (title.includes("speaker")) return "speaker";
  if (title.includes("power bank")) return "accessoryKit";
  if (title.includes("tablet")) return "monitor";
  if (title.includes("phone")) return "monitor";
  if (title.includes("camera kit") || title.includes("camera")) return "dslr";
  if (title.includes("laptop")) return "gamingLaptop";

  if (title.includes("corolla") || title.includes("sedan")) return "carSedan";
  if (
    title.includes("hilux") ||
    title.includes("pickup") ||
    title.includes("ranger")
  )
    return "pickup";
  if (
    title.includes("suv") ||
    title.includes("patrol") ||
    title.includes("tucson") ||
    title.includes("rav4")
  )
    return "suv";
  if (title.includes("van") || title.includes("hiace")) return "van";
  if (title.includes("truck") || title.includes("canter")) return "truck";

  if (category === "cars bikes" || category === "vehicles") return "carSedan";
  if (category === "electronics cameras")
    return title.includes("sony") || title.includes("mirrorless")
      ? "mirrorless"
      : "dslr";
  if (category === "event essentials") {
    if (title.includes("generator")) return "generator";
    if (title.includes("projector")) return "projector";
    if (title.includes("light")) return "lighting";
    if (title.includes("cable")) return "cable";
    if (title.includes("mixer")) return "mixer";
    return "projector";
  }
  if (category === "party wedding") {
    if (title.includes("tent")) return "tent";
    if (title.includes("stage")) return "stage";
    if (title.includes("table")) return "tableSet";
    if (title.includes("chair")) return "chairsSet";
    if (title.includes("barrier")) return "barrier";
    if (title.includes("carpet")) return "redCarpet";
    return "chairsSet";
  }
  if (category === "tools equipment") {
    if (title.includes("drill")) return "drill";
    if (title.includes("saw")) return "saw";
    if (title.includes("pressure")) return "pressureWasher";
    if (title.includes("scaffold")) return "scaffold";
    if (title.includes("compressor")) return "compressor";
    return "drill";
  }
  if (category === "baby kids") {
    if (title.includes("stroller")) return "stroller";
    if (title.includes("crib")) return "crib";
    if (title.includes("car seat")) return "carSeat";
    if (title.includes("walker")) return "walker";
    if (title.includes("high chair")) return "highChair";
    if (title.includes("playpen")) return "playpen";
    return "stroller";
  }
  if (category === "beauty salon") {
    if (title.includes("barber")) return "barberChair";
    if (title.includes("styling")) return "stylingChair";
    if (title.includes("steamer")) return "facialSteamer";
    if (title.includes("dryer")) return "hairDryer";
    if (title.includes("massage")) return "massageBed";
    if (title.includes("wax")) return "waxHeater";
    return "barberChair";
  }
  if (category === "furniture") {
    if (title.includes("sofa")) return "sofa";
    if (title.includes("dining")) return "diningTable";
    if (title.includes("desk")) return "desk";
    if (title.includes("chair")) return "officeChair";
    if (title.includes("wardrobe")) return "wardrobe";
    return "conferenceTable";
  }
  if (category === "home appliances") {
    if (title.includes("washer")) return "washer";
    if (title.includes("freezer")) return "freezer";
    if (title.includes("microwave")) return "microwave";
    if (title.includes("water")) return "waterDispenser";
    if (title.includes("vacuum")) return "vacuum";
    return "fridge";
  }
  if (category === "office equipment") {
    if (title.includes("printer")) return "printer";
    if (title.includes("copier")) return "copier";
    if (title.includes("screen") || title.includes("projector"))
      return "projectorScreen";
    if (title.includes("whiteboard")) return "whiteboard";
    return "officeChair";
  }
  if (category === "sports outdoor") {
    if (title.includes("bike")) return "bike";
    if (title.includes("tent")) return "campingTent";
    if (title.includes("treadmill")) return "treadmill";
    if (title.includes("chair")) return "campingChair";
    if (title.includes("grill")) return "grill";
    if (title.includes("football")) return "football";
    return "bike";
  }
  if (category === "travel camping") {
    if (title.includes("sleeping bag")) return "sleepingBag";
    if (title.includes("backpack")) return "backpack";
    if (title.includes("stove")) return "stove";
    if (title.includes("cooler")) return "cooler";
    if (title.includes("lantern")) return "lantern";
    return "campingTent";
  }
  if (category === "gaming") {
    if (title.includes("xbox")) return "xbox";
    if (title.includes("switch")) return "switch";
    if (title.includes("chair")) return "gamingChair";
    if (title.includes("vr")) return "vr";
    if (title.includes("monitor")) return "monitor";
    if (title.includes("laptop")) return "gamingLaptop";
    return "ps5";
  }
  if (category === "fashion accessories") {
    if (title.includes("dress") || title.includes("traditional"))
      return "fashionDress";
    if (title.includes("suit")) return "fashionSuit";
    if (
      title.includes("bag") ||
      title.includes("shoe") ||
      title.includes("nail")
    )
      return "accessoryKit";
    return "fashionDress";
  }

  return null;
}

function buildGalleryPlan(listing) {
  const title = normalize(listing.title);

  if (fixedTitles.has(title)) {
    return {
      key: `fixed:${title}`,
      fixed: true,
      urls: fixedGalleryUrls[title] || [],
    };
  }

  const key = resolveGalleryKey(listing);
  if (!key) return null;

  const sourceUrl = galleries[key]?.[0];
  if (!sourceUrl) return null;

  return {
    key,
    fixed: false,
    sourceUrl,
    outputSlug: slugify(listing.title || key),
    urls: [],
  };
}

module.exports = {
  buildGalleryPlan,
  fixedTitles,
  normalize,
  resolveGalleryKey,
};
