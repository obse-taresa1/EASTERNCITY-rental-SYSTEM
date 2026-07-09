const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export function getStorageItem(key, fallbackValue = null) {
  if (!useMockAuth) return fallbackValue;
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

export function setStorageItem(key, value) {
  if (!useMockAuth) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key) {
  if (!useMockAuth) return;
  localStorage.removeItem(key);
}

export const readStorage = getStorageItem;
export const writeStorage = setStorageItem;
export const removeStorage = removeStorageItem;
