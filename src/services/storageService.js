export function getStorageItem(key, fallbackValue = null) {
  return readLocalStorage(key, fallbackValue);
}

export function setStorageItem(key, value) {
  writeLocalStorage(key, value);
}

export function removeStorageItem(key) {
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
