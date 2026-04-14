import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { addDays, format } from "date-fns";
import { Text, TouchableOpacity, View } from "react-native";

type DoseStatus = "taken" | "due" | "upcoming" | "idle";

type Dose = {
  id: string;
  drugName: string;
  dosage?: string;
  instruction?: string;
  time?: string;
  iconLib?: "Feather" | "Ionicons" | "MaterialIcons";
  iconName?: string;
  iconColor: string;
  status: DoseStatus;
};

// Helper: generate a date key string from a Date object — same format used at lookup time
const toKey = (date: Date) => format(date, "yyyy-MM-dd");

// Today + adjacent days for demo data
const today = new Date();

const DOSES_BY_DATE: Record<string, Dose[]> = {
  // ── TODAY ──────────────────────────────────────────────
  [toKey(today)]: [
    {
      id: "1",
      drugName: "Paracetamol",
      dosage: "500mg",
      instruction: "After Food",
      time: "08:00 AM",
      iconLib: "Feather",
      iconName: "edit-2",
      iconColor: "#10B981",
      status: "taken",
    },
    {
      id: "2",
      drugName: "Vitamin C",
      dosage: "1000mg",
      instruction: "Daily Dose",
      time: "DUE NOW",
      iconLib: "MaterialIcons",
      iconName: "local-pharmacy",
      iconColor: "#F97316",
      status: "due",
    },
    {
      id: "3",
      drugName: "Amoxicillin",
      dosage: "250mg",
      instruction: "Capsule",
      time: "02:00 PM",
      iconLib: "MaterialIcons",
      iconName: "medical-services",
      iconColor: "#8B5CF6",
      status: "upcoming",
    },
    {
      id: "4",
      drugName: "Insulin",
      dosage: "10 Units",
      instruction: "Before Bed",
      time: "09:00 PM",
      iconLib: "MaterialIcons",
      iconName: "vaccines",
      iconColor: "#F43F5E",
      status: "idle",
    },
  ],

  // ── YESTERDAY ──────────────────────────────────────────
  [toKey(addDays(today, -1))]: [
    {
      id: "1",
      drugName: "Paracetamol",
      dosage: "500mg",
      instruction: "After Food",
      time: "08:00 AM",
      iconLib: "Feather",
      iconName: "edit-2",
      iconColor: "#10B981",
      status: "taken",
    },
    {
      id: "2",
      drugName: "Ibuprofen",
      dosage: "400mg",
      instruction: "With Meals",
      time: "01:00 PM",
      iconLib: "MaterialIcons",
      iconName: "local-pharmacy",
      iconColor: "#F97316",
      status: "taken",
    },
  ],

  // ── TOMORROW ───────────────────────────────────────────
  [toKey(addDays(today, 1))]: [
    {
      id: "1",
      drugName: "Vitamin D",
      dosage: "2000 IU",
      instruction: "Morning",
      time: "09:00 AM",
      iconLib: "Ionicons",
      iconName: "sunny",
      iconColor: "#F59E0B",
      status: "upcoming",
    },
    {
      id: "2",
      drugName: "Omega-3",
      dosage: "1 capsule",
      instruction: "With Food",
      time: "01:00 PM",
      iconLib: "Feather",
      iconName: "droplet",
      iconColor: "#60A5FA",
      status: "upcoming",
    },
    {
      id: "3",
      drugName: "Insulin",
      dosage: "10 Units",
      instruction: "Before Bed",
      time: "09:00 PM",
      iconLib: "MaterialIcons",
      iconName: "vaccines",
      iconColor: "#F43F5E",
      status: "upcoming",
    },
  ],

  // ── DAY AFTER TOMORROW ─────────────────────────────────
  [toKey(addDays(today, 2))]: [
    {
      id: "1",
      drugName: "Metformin",
      dosage: "500mg",
      instruction: "After Breakfast",
      time: "08:30 AM",
      iconLib: "MaterialIcons",
      iconName: "medical-services",
      iconColor: "#8B5CF6",
      status: "upcoming",
    },
    {
      id: "2",
      drugName: "Vitamin C",
      dosage: "1000mg",
      instruction: "Daily Dose",
      time: "12:00 PM",
      iconLib: "MaterialIcons",
      iconName: "local-pharmacy",
      iconColor: "#F97316",
      status: "upcoming",
    },
  ],

  // ── 3 DAYS FROM NOW ────────────────────────────────────
  [toKey(addDays(today, 3))]: [], // empty = "No doses scheduled"
};

type Props = {
  selectedDate: Date;
};

function RenderIcon({
  lib,
  name,
  color,
}: {
  lib?: Dose["iconLib"];
  name?: string;
  color: string;
}) {
  if (lib === "Ionicons")
    return (
      <Ionicons name={(name as any) || "ellipse"} size={22} color={color} />
    );
  if (lib === "MaterialIcons")
    return (
      <MaterialIcons name={(name as any) || "info"} size={22} color={color} />
    );
  return <Feather name={(name as any) || "circle"} size={22} color={color} />;
}

const CARD_BG: Record<DoseStatus, string> = {
  taken: "bg-dose-taken",
  due: "bg-dose-due",
  upcoming: "bg-dose-upcoming",
  idle: "bg-dose-idle",
};

const ICON_BG: Record<DoseStatus, string> = {
  taken: "bg-[#d1fae5]",
  due: "bg-[#ffe4d0]",
  upcoming: "bg-[#ede9fe]",
  idle: "bg-[#ffe4e6]",
};

export default function Doses({ selectedDate }: Props) {
  const dateKey = toKey(selectedDate);
  // If the key exists but is empty array → show empty state
  // If the key doesn't exist at all → also show empty state (no fallback to avoid confusion)
  const doses = DOSES_BY_DATE[dateKey] ?? [];

  return (
    <View className="w-full px-4 pt-3 gap-3">
      {doses.length === 0 ? (
        <View className="items-center py-10">
          <Text
            className="text-gray-400 text-sm"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            No doses scheduled for this day.
          </Text>
        </View>
      ) : (
        doses.map((d) => (
          <View
            key={d.id}
            className={`w-full rounded-2xl p-4 ${CARD_BG[d.status]}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
              gap: 14,
            }}>
            {/* Top row */}
            <View className="flex-row items-center gap-3">
              <View
                className={`w-12 h-12 rounded-xl items-center justify-center ${ICON_BG[d.status]}`}>
                <RenderIcon
                  lib={d.iconLib}
                  name={d.iconName}
                  color={d.iconColor}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-dark text-base"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {d.drugName}
                </Text>
                <Text
                  className="text-gray-400 text-xs mt-0.5"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {d.dosage} · {d.instruction}
                </Text>
              </View>
              {d.status === "due" ? (
                <View className="bg-[#fef3c7] px-3 py-1 rounded-full">
                  <Text
                    className="text-dose-dueText text-[11px] tracking-wide"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    DUE NOW
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-gray-400 text-xs"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {d.time}
                </Text>
              )}
            </View>

            {/* Action row */}
            <View className="flex-row gap-2">
              {d.status === "taken" && (
                <View className="flex-1 flex-row items-center justify-center py-3 rounded-2xl bg-dose-takenText gap-2">
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Taken
                  </Text>
                </View>
              )}
              {d.status === "due" && (
                <>
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 rounded-2xl bg-dark gap-2">
                    <Feather name="check-circle" size={16} color="#fff" />
                    <Text
                      className="text-white text-sm"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Mark as Taken
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="px-5 py-3 rounded-2xl border border-dose-dueText items-center justify-center">
                    <Text
                      className="text-dose-dueText text-sm"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Skip
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {d.status === "upcoming" && (
                <TouchableOpacity className="flex-1 flex-row items-center justify-between py-3 px-4 rounded-2xl border border-[#ddd6fe]">
                  <Text
                    className="text-dose-upcomingText text-sm"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Upcoming
                  </Text>
                  <Text
                    className="text-dose-upcomingText text-base tracking-widest"
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    ···
                  </Text>
                </TouchableOpacity>
              )}
              {d.status === "idle" && (
                <TouchableOpacity className="flex-1 flex-row items-center justify-between py-3 px-4 rounded-2xl border border-[#fecdd3]">
                  <Text
                    className="text-dose-idleText text-sm"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Remind me
                  </Text>
                  <Text
                    className="text-dose-idleText text-base tracking-widest"
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    ···
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}
