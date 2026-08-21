// src/utils/categoryIcons.js
// Centralized mapping of category names to Lucide React icons.

import {
  Car,
  Camera,
  PartyPopper,
  CalendarDays,
  Hammer,
  Sofa,
  Refrigerator,
  Bike,
  Tent,
  Printer,
  Scissors,
  Baby,
  Gamepad2,
  Shirt,
} from "lucide-react";

/**
 * Returns the Lucide icon component for a given category name.
 * If the category is not mapped, returns undefined.
 */
export function getCategoryIcon(categoryName) {
  const map = {
    "Cars & Bikes": Car,
    "Electronics & Cameras": Camera,
    "Party & Wedding": PartyPopper,
    "Event Essentials": CalendarDays,
    "Construction & DIY": Hammer,
    "Furniture": Sofa,
    "Home Appliances": Refrigerator,
    "Sports & Outdoor": Bike,
    "Travel & Camping": Tent,
    "Office Equipment": Printer,
    "Beauty & Salon": Scissors,
    "Baby & Kids": Baby,
    "Gaming Equipment": Gamepad2,
    "Fashion & Accessories": Shirt,
  };
  return map[categoryName];
}
