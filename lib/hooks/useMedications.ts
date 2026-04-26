// lib/hooks/useMedications.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import {
  APIMedication,
  CreateMedicationBody,
  UpdateMedicationBody,
} from "../api/types";
import { useGuest } from "../context/GuestContext";

export const useMedications = () => {
  const { guestId, isReady } = useGuest();
  const [medications, setMedications] = useState<APIMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<APIMedication[]>("/medications", guestId);
      setMedications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  // Auto-fetch once guestId is available
  useEffect(() => {
    if (isReady && guestId) fetch();
  }, [isReady, guestId, fetch]);

  const addMedication = async (body: CreateMedicationBody) => {
    if (!guestId) return;
    const created = await api.post<APIMedication>("/medications", body, guestId);
    // Optimistically prepend to list
    setMedications((prev) => [created, ...prev]);
    return created;
  };

  const updateMedication = async (id: string, body: UpdateMedicationBody) => {
    if (!guestId) return;
    const updated = await api.put<APIMedication>(
      `/medications/${id}`,
      body,
      guestId
    );
    setMedications((prev) => prev.map((m) => (m._id === id ? updated : m)));
    return updated;
  };

  const deleteMedication = async (id: string) => {
    if (!guestId) return;
    await api.delete(`/medications/${id}`, guestId);
    setMedications((prev) => prev.filter((m) => m._id !== id));
  };

  const toggleStatus = async (id: string, status: "Active" | "Inactive") => {
    if (!guestId) return;
    const updated = await api.patch<APIMedication>(
      `/medications/${id}/status`,
      { status },
      guestId
    );
    setMedications((prev) => prev.map((m) => (m._id === id ? updated : m)));
    return updated;
  };

  return {
    medications,
    loading,
    error,
    refetch: fetch,
    addMedication,
    updateMedication,
    deleteMedication,
    toggleStatus,
  };
};
