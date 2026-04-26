// lib/hooks/useDoseLogs.ts
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { APIDoseLog } from "../api/types";
import { useGuest } from "../context/GuestContext";

export const useDoseLogs = (date?: Date) => {
  const { guestId, isReady } = useGuest();
  const [logs, setLogs] = useState<APIDoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      setError(null);

      // Build query params — filter by date if provided
      const params = new URLSearchParams();
      if (date) params.set("date", format(date, "yyyy-MM-dd"));

      const data = await api.get<APIDoseLog[]>(
        `/dose-logs?${params.toString()}`,
        guestId
      );
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guestId, date]);

  useEffect(() => {
    if (isReady && guestId) fetch();
  }, [isReady, guestId, fetch]);

  const markDose = async (
    logId: string,
    status: "TAKEN" | "MISSED" | "SKIPPED" 
  ) => {
    if (!guestId) return;
    const updated = await api.patch<APIDoseLog>(
      `/dose-logs/${logId}`,
      { status },
      guestId
    );
    setLogs((prev) => prev.map((l) => (l._id === logId ? updated : l)));
    return updated;
  };

  // Count helpers — used in the header "X of Y Taken"
  const takenCount = logs.filter((l) => l.status === "TAKEN").length;
const totalCount = logs.length;
  return {
    logs,
    loading,
    error,
    refetch: fetch,
    markDose,
    takenCount,
    totalCount,
  };
};
