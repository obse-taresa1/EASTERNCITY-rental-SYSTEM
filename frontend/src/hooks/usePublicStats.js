import { useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";

export default function usePublicStats() {
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    activeListings: 0,
    cities: 3,
    averageRating: 5.0,
    loading: true
  });

  useEffect(() => {
    let mounted = true;
    apiClient.get("/api/public-stats")
      .then(res => {
        if (mounted && res) {
          setStats({
            ...res,
            loading: false
          });
        }
      })
      .catch(err => {
        console.error("Failed to load public stats", err);
        if (mounted) {
          setStats(s => ({ ...s, loading: false }));
        }
      });
    return () => { mounted = false; };
  }, []);

  return stats;
}
