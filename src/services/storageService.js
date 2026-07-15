const MOCK_DATA_KEYS = [
  "rental_bookings",
  "rental_reviews",
  "easterncity_contact_messages",
  "easterncity_listings",
  "easterncity_notifications",
  "support_tickets"
];

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export function getStorageItem(key, fallbackValue = null) {
  if (!useMockAuth && MOCK_DATA_KEYS.includes(key)) return fallbackValue;
  return readLocalStorage(key, fallbackValue);
}

export function setStorageItem(key, value) {
  if (!useMockAuth && MOCK_DATA_KEYS.includes(key)) return;
  writeLocalStorage(key, value);
}

export function removeStorageItem(key) {
  if (!useMockAuth && MOCK_DATA_KEYS.includes(key)) return;
  removeLocalStorage(key);
}

function readLocalStorage(key, fallbackValue = null) {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

function writeLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeLocalStorage(key) {
  localStorage.removeItem(key);
}

export const readStorage = readLocalStorage;
export const writeStorage = writeLocalStorage;
export const removeStorage = removeLocalStorage;
