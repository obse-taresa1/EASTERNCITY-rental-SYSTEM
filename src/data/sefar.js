/**
 * Sefar (Neighbourhood) data for EasternCity service areas.
 * Names are in English transliteration only.
 */
export const sefarByCity = {
  Jigjiga: [
    "Sheedaha",
    "Kebele 01",
    "Kebele 02",
    "Kebele 03",
    "Kebele 04",
    "Kebele 05",
  ],
  "Dire Dawa": [
    "Kefira",
    "Sabian",
    "Gende Kore",
    "Megala",
    "Dechatu",
    "Legehare",
  ],
  Harar: [
    "Aboker",
    "Amir Nur",
    "Jugal",
    "Arategna",
    "Jenella",
    "Shenkor",
  ],
};

/**
 * Get sefar list for a given city.
 * Returns empty array if city not found.
 */
export function getSefarByCity(city) {
  return sefarByCity[city] || [];
}
