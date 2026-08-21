import { useState, useEffect } from 'react';

/**
 * useDebounce hook
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default 300)
 * @returns Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
