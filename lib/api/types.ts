// lib/api/types.ts
// These mirror the backend Mongoose models exactly.

export interface APIMedication {
  _id: string;
  userId: string;
  name: string;
  type: string;
  dosage: {
    value: number;
    unit: string;
  };
  scheduleType: "Once Daily" | "Morning & Evening" | "Three Times";
  times: string[]; // e.g. ["08:00", "20:00"]
  startDate: string; // ISO date string
  endDate?: string;
  notes?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  nextDose: string;
  color: string;
  status: "active" | "paused" | "completed";
  icon?: string;
  category?: string;
  notes?: string;
};

export interface APIDoseLog {
  _id: string;
  userId: string;
  medicationId: string | APIMedication; // populated when fetched with ?populate=true
  scheduledTime: string; // ISO date string
  status: "TAKEN" | "MISSED" | "SKIPPED" | "UPCOMING";
  takenAt?: string;
  createdAt: string;
}

export interface APIUser { 
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: "Female" | "Male" | "Other";
  dateOfBirth?: string;
  profileImage?: string;
  settings: {
    highPriorityAlarms: boolean;
    dailyReminders: boolean;
  };
}

export interface APIStats {
  weeklyAccuracy: number; // 0–100
  streak: number;         // consecutive days
  total: number;
  taken: number;
}

// ── Request body shapes ───────────────────────────────────────────────────────

export type CreateMedicationBody = Omit<
  APIMedication,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateMedicationBody = Partial<CreateMedicationBody>;

export type UpdateProfileBody = Partial<
  Pick<APIUser, "fullName" | "phoneNumber" | "gender" | "dateOfBirth">
>;

export type UpdateSettingsBody = {
  highPriorityAlarms?: boolean;
  dailyReminders?: boolean;
};
