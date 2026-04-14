import { HistoryEntry, Medication, RecentActivity } from "./types.ts";

export const ACTIVE_MEDS: Medication[] = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500",
    unit: "mg",
    frequency: "Every 6 hours",
    nextDose: "08:00 PM",
    color: "#F97316",
    status: "active",
    icon: "pill",
    category: "PAIN RELIEF",
    notes:
      "Take after breakfast and dinner with a full glass of water. Avoid caffeine within 1 hour.",
  },
  {
    id: "2",
    name: "Amoxicillin",
    dosage: "250",
    unit: "mg",
    frequency: "3 times daily",
    nextDose: "02:00 PM",
    color: "#8B5CF6",
    status: "active",
    icon: "capsule",
    category: "ANTIBIOTIC",
  },
  {
    id: "3",
    name: "Vitamin C",
    dosage: "1000",
    unit: "mg",
    frequency: "Once daily (Morning)",
    nextDose: "08:00 AM",
    color: "#10B981",
    status: "active",
    icon: "pill",
    category: "SUPPLEMENT",
  },
  {
    id: "4",
    name: "Omeprazole",
    dosage: "20",
    unit: "mg",
    frequency: "Before breakfast",
    nextDose: "07:00 AM",
    color: "#60A5FA",
    status: "active",
    icon: "pill",
    category: "DIGESTIVE",
  },
];

export const RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    status: "taken",
  },
  {
    id: "2",
    name: "Amoxicillin",
    dosage: "250mg",
    time: "08:30 AM",
    status: "missed",
  },
  {
    id: "3",
    name: "Vitamin C",
    dosage: "1000mg",
    time: "07:15 AM",
    status: "taken",
  },
];

export const HISTORY: HistoryEntry[] = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Today",
    taken: true,
  },
  {
    id: "2",
    name: "Vitamin C",
    dosage: "1000mg",
    time: "08:00 AM",
    date: "Today",
    taken: true,
  },
  {
    id: "3",
    name: "Amoxicillin",
    dosage: "250mg",
    time: "08:00 AM",
    date: "Today",
    taken: false,
  },
  {
    id: "4",
    name: "Lisinopril",
    dosage: "10mg",
    time: "06:05 AM",
    date: "Today",
    taken: true,
  },
  {
    id: "5",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Yesterday",
    taken: true,
  },
  {
    id: "6",
    name: "Vitamin C",
    dosage: "1000mg",
    time: "08:00 AM",
    date: "Yesterday",
    taken: true,
  },
  {
    id: "7",
    name: "Omega-3",
    dosage: "1 cap",
    time: "09:00 PM",
    date: "Yesterday",
    taken: false,
  },
  {
    id: "8",
    name: "Multivitamin",
    dosage: "1 tab",
    time: "08:30 AM",
    date: "Yesterday",
    taken: true,
  },
  {
    id: "9",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Apr 6, 2026",
    taken: true,
  },
  {
    id: "10",
    name: "Vitamin C",
    dosage: "1000mg",
    time: "08:00 AM",
    date: "Apr 6, 2026",
    taken: true,
  },
  {
    id: "11",
    name: "Omega-3",
    dosage: "1 cap",
    time: "09:00 PM",
    date: "Apr 6, 2026",
    taken: true,
  },
  {
    id: "12",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Apr 5, 2026",
    taken: true,
  },
  {
    id: "13",
    name: "Amoxicillin",
    dosage: "250mg",
    time: "08:00 AM",
    date: "Apr 5, 2026",
    taken: false,
  },
  {
    id: "14",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Apr 4, 2026",
    taken: true,
  },
];

export const makeTime = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export const fmt = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const fmtDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "mm/dd/yy";

export const SCHEDULE_PRESETS: {
  label: string;
  times: Omit<import("./types").DoseTime, "id">[];
}[] = [
  { label: "ONCE DAILY", times: [{ time: makeTime(8), label: "MORNING" }] },
  {
    label: "TWICE DAILY",
    times: [
      { time: makeTime(8), label: "MORNING" },
      { time: makeTime(20), label: "EVENING" },
    ],
  },
  {
    label: "THREE TIMES",
    times: [
      { time: makeTime(8), label: "MORNING" },
      { time: makeTime(14), label: "AFTERNOON" },
      { time: makeTime(20), label: "EVENING" },
    ],
  },
];
