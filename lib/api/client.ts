// lib/api/client.ts
// Every request goes through this. It automatically attaches x-guest-id.
// When you switch to Passport auth later, you only need to change this one file:
// replace the x-guest-id header with an Authorization: Bearer <token> header.

import { API_BASE_URL } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  guestId: string;
}

async function request<T>(
  path: string,
  { method = "GET", body, guestId }: RequestOptions
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // ── Auth swap point ──────────────────────────────────────────────────
      // Guest mode:  send the stored guestId as a header
      // Future auth: replace this with `Authorization: Bearer ${token}`
      "x-guest-id": guestId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the backend's error message if available
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }

  return data as T;
}

// ── Typed convenience wrappers ────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, guestId: string) =>
    request<T>(path, { guestId }),

  post: <T>(path: string, body: unknown, guestId: string) =>
    request<T>(path, { method: "POST", body, guestId }),

  put: <T>(path: string, body: unknown, guestId: string) =>
    request<T>(path, { method: "PUT", body, guestId }),

  patch: <T>(path: string, body: unknown, guestId: string) =>
    request<T>(path, { method: "PATCH", body, guestId }),

  delete: <T>(path: string, guestId: string) =>
    request<T>(path, { method: "DELETE", guestId }),

  // Special case for multipart/form-data (avatar upload)
  // We can't set Content-Type manually here — the browser/RN sets it with boundary
  uploadFormData: async <T>(
    path: string,
    formData: FormData,
    guestId: string
  ): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "x-guest-id": guestId },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? `Upload failed: ${res.status}`);
    return data as T;
  },
};
