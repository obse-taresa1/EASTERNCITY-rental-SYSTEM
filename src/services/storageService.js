export function readStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const getStorageItem = readStorage;
export const setStorageItem = writeStorage;

export function removeStorage(key) {
  localStorage.removeItem(key);
}
