/**
 * Category-specific fallback images for listings without uploaded photos.
 * Keyed by the canonical rental category ID (from items.js).
 */

import electronicsImg from "../assets/images/cat_electronics.jpg";
import vehiclesImg from "../assets/images/hero_vehicles.png";
import carsImg from "../assets/images/vehsvu.png";
import partyImg from "../assets/images/party_wedding_chairs.jpg";
import eventImg from "../assets/images/party_wedding_chairs.jpg";
import furnitureImg from "../assets/images/furnsofa.png";
import constructionImg from "../assets/images/dewalt.png";
import sportsImg from "../assets/images/sportbick.png";
import gadgetsImg from "../assets/images/gadgets_ps5_vr.jpg";
import homeAppliancesImg from "../assets/images/electrotv.png";
import musicImg from "../assets/images/electrospkear.png";
import officeImg from "../assets/images/projector.png";
import beautyImg from "../assets/images/beauty_salon_station.jpg";
import babyImg from "../assets/images/harari_wedding_dress_1.png";
import gamingImg from "../assets/images/gadgets_ps5_vr.jpg";
import travelImg from "../assets/images/sportclim.png";
import fashionImg from "../assets/images/harari_wedding_dress_2.jpg";
import defaultImg from "../assets/images/hero_electronics.png";

const categoryFallbacks = {
  "electronics-cameras": electronicsImg,
  "vehicles": vehiclesImg,
  "cars-bikes": carsImg,
  "party-wedding": partyImg,
  "event-essentials": eventImg,
  "furniture": furnitureImg,
  "construction-diy": constructionImg,
  "sports-outdoor": sportsImg,
  "gadgets": gadgetsImg,
  "home-appliances": homeAppliancesImg,
  "music-audio": musicImg,
  "office-equipment": officeImg,
  "beauty-salon": beautyImg,
  "cultural-wedding-dress": babyImg,
  "gaming-equipment": gamingImg,
  "travel-camping": travelImg,
  "fashion-accessories": fashionImg,
};

/**
 * Returns the best fallback image for a given category ID.
 * Falls back to a generic image if the category is unknown.
 * @param {string} categoryId - canonical category ID
 * @returns {string} - image URL
 */
export function getCategoryFallbackImage(categoryId) {
  if (!categoryId) return defaultImg;
  const key = String(categoryId).toLowerCase().trim();
  return categoryFallbacks[key] || defaultImg;
}

export default categoryFallbacks;
