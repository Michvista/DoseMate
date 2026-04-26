// lib/hooks/useStats.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { useGuest } from "../context/GuestContext";

export interface DailyBar {
  day: string; // "Mon", "Tue", etc.
  accuracy: number; // 0-100
}

export interface APIStats {
  weeklyAccuracy: number;
  streak: number;
  total: number;
  taken: number;
  dailyStats: DailyBar[]; // 7 entries, Mon → Sun
}

export const useStats = () => {
  const { guestId, isReady } = useGuest();
  const [stats, setStats] = useState<APIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<APIStats>("/dose-logs/stats", guestId);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    if (isReady && guestId) fetch();
  }, [isReady, guestId, fetch]);

  return { stats, loading, error, refetch: fetch };
};
