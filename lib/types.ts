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

export type HistoryEntry = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  date: string;
  taken: boolean;
};

export type RecentActivity = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: "taken" | "missed";
};

export type DoseTime = { id: string; time?: Date; label?: string };

export const STATUS_COLORS = {
  active: { bg: "bg-dose-taken", text: "text-dose-takenText", label: "Active" },
  paused: {
    bg: "bg-dose-upcoming",
    text: "text-dose-upcomingText",
    label: "Paused",
  },
  completed: {
    bg: "bg-light1",
    text: "text-splashScreen-100",
    label: "Completed",
  },
  taken: {
    bg: "bg-lighter",
    text: "text-tabs-100",
    label: "TAKEN",
    hex: "#9333EA",
  },
  missed: {
    bg: "bg-missedlight",
    text: "text-missed",
    label: "MISSED",
    hex: "#EF4444",
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  "PAIN RELIEF": "#F97316",
  ANTIBIOTIC: "#8B5CF6",
  SUPPLEMENT: "#10B981",
  DIGESTIVE: "#60A5FA",
};
