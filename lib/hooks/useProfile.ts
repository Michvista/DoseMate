// lib/hooks/useProfile.ts
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import {
  APIUser,
  UpdateProfileBody,
  UpdateSettingsBody,
} from "../api/types";
import { useGuest } from "../context/GuestContext";

export const useProfile = () => {
  const { guestId, isReady } = useGuest();
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<APIUser>("/users/me", guestId);
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    if (isReady && guestId) fetch();
  }, [isReady, guestId, fetch]);

  const updateProfile = async (body: UpdateProfileBody) => {
    if (!guestId) return;
    setSaving(true);
    try {
      const updated = await api.put<APIUser>("/users/me", body, guestId);
      setUser(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async (body: UpdateSettingsBody) => {
    if (!guestId) return;
    const updated = await api.patch<APIUser>("/users/me/settings", body, guestId);
    setUser(updated);
    return updated;
  };

  const uploadAvatar = async (localUri: string) => {
    if (!guestId) return;

    // Build FormData the React Native way
    const formData = new FormData();
    formData.append("avatar", {
      uri: localUri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);

    const result = await api.uploadFormData<{ profileImage: string }>(
      "/users/me/avatar",
      formData,
      guestId
    );

    // Update local state with the new Cloudinary URL
    setUser((prev) =>
      prev ? { ...prev, profileImage: result.profileImage } : prev
    );

    return result.profileImage;
  };

  return {
    user,
    loading,
    saving,
    error,
    refetch: fetch,
    updateProfile,
    updateSettings,
    uploadAvatar,
  };
};
