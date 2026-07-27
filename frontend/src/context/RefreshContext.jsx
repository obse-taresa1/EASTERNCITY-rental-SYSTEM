import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const RefreshContext = createContext(null);
const subscribers = new Set();

export function emitRefresh(scope) {
  subscribers.forEach((listener) => listener(scope));
}

export function RefreshProvider({ children }) {
  const [signals, setSignals] = useState({});

  useEffect(() => {
    function handleRefresh(scope) {
      setSignals((current) => ({
        ...current,
        [scope]: (current[scope] || 0) + 1,
      }));
    }

    subscribers.add(handleRefresh);
    return () => {
      subscribers.delete(handleRefresh);
    };
  }, []);

  const refresh = useCallback((scope) => {
    emitRefresh(scope);
  }, []);

  const value = useMemo(() => ({ refresh, signals }), [refresh, signals]);

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
}

export function useRefreshToken(scopes) {
  const { signals } = useRefresh();
  const watchedScopes = Array.isArray(scopes) ? scopes : [scopes];
  return watchedScopes.map((scope) => signals[scope] || 0).join(":");
}
