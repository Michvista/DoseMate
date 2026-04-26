// components/Doses.tsx
import { APIDoseLog } from "@/lib/api/types";
import { useDoseLogs } from "@/lib/hooks/useDoseLogs";
import { MedicationIcons } from "@/lib/MedicationIcons";
import { Feather } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UIStatus = "taken" | "due" | "upcoming" | "missed" | "skipped";

const CARD_BG: Record<UIStatus, string> = {
  taken: "bg-dose-taken",
  due: "bg-dose-due",
  upcoming: "bg-dose-upcoming",
  missed: "bg-dose-due",
  skipped: "bg-dose-idle",
};

const ICON_BG: Record<UIStatus, string> = {
  taken: "bg-[#d1fae5]",
  due: "bg-[#ffe4d0]",
  upcoming: "bg-[#ede9fe]",
  missed: "bg-[#fee2e2]",
  skipped: "bg-[#f3f4f6]",
};

function toUIStatus(log: APIDoseLog): UIStatus {
  if (log.status === "TAKEN") return "taken";
  if (log.status === "MISSED") return "missed";
  if (log.status === "SKIPPED") return "skipped";
  // UPCOMING but scheduled time has passed → DUE NOW
  if (new Date(log.scheduledTime) < new Date()) return "due";
  return "upcoming";
}

function MedIcon({ type, color }: { type: string; color: string }) {
  const Icon = (MedicationIcons as any)[type] ?? (MedicationIcons as any).pill;
  return <Icon size={22} color={color} />;
}

const TYPE_COLORS: Record<string, string> = {
  pill: "#10B981",
  capsule: "#8B5CF6",
  liquid: "#3B82F6",
  injection: "#F43F5E",
  patch: "#F97316",
};

type Props = { selectedDate: Date };

export default function Doses({ selectedDate }: Props) {
  const { logs, loading, markDose } = useDoseLogs(selectedDate);

  const handleMarkTaken = async (log: APIDoseLog) => {
    try {
      await markDose(log._id, "TAKEN");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSkip = async (log: APIDoseLog) => {
    try {
      await markDose(log._id, "SKIPPED");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ── FIX #1: Undo skip → reset to UPCOMING, NOT to TAKEN ──────────────────
  // This makes the card go back to its original state with both buttons showing
  const handleUndoSkip = async (log: APIDoseLog) => {
    try {
      await markDose(log._id, "UPCOMING");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View className="w-full px-4 pt-6 items-center">
        <ActivityIndicator color="#9333EA" />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View className="w-full px-4 pt-10 items-center">
        <Text
          className="text-gray-400 text-sm"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          No doses scheduled for this day.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-4 pt-3 gap-3">
      {logs.map((log) => {
        const uiStatus = toUIStatus(log);

        // const med =
        //   typeof log.medicationId === "object"
        //     ? (log.medicationId as any)
        //     : null;
        // const medName = med?.name ?? "Medication";
        // const medType = med?.type ?? "pill";
        // const dosageStr = med ? `${med.dosage?.value}${med.dosage?.unit}` : "";
        // const scheduleType = med?.scheduleType ?? "";

// Find where you define med, medName, etc., and replace with this:
const med = log.medicationId;
const isMedObject = typeof med === "object" && med !== null;

// Now TypeScript knows that if isMedObject is true, 'med' has properties
const medName = isMedObject ? (med as any).name : "Medication";
const medType = isMedObject ? (med as any).type : "pill";
const dosageStr = isMedObject 
  ? `${(med as any).dosage?.value}${(med as any).dosage?.unit}` 
  : "";
const scheduleType = isMedObject ? (med as any).scheduleType : "";


        const color = TYPE_COLORS[medType] ?? "#8B5CF6";
        const timeLabel = format(new Date(log.scheduledTime), "hh:mm a");

        return (
          <View
            key={log._id}
            className={`w-full rounded-2xl p-4 ${CARD_BG[uiStatus]}`}
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
                className={`w-12 h-12 rounded-xl items-center justify-center ${ICON_BG[uiStatus]}`}>
                <MedIcon type={medType} color={color} />
              </View>

              <View className="flex-1">
                <Text
                  className="text-dark text-base"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {medName}
                </Text>
                <Text
                  className="text-gray-400 text-xs mt-0.5"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {dosageStr}
                  {dosageStr && scheduleType ? " · " : ""}
                  {scheduleType}
                </Text>
              </View>

              {uiStatus === "due" ? (
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
                  {timeLabel}
                </Text>
              )}
            </View>

            {/* Action row */}
            <View className="flex-row gap-2">
              {/* TAKEN — static confirmation badge */}
              {uiStatus === "taken" && (
                <View className="flex-1 flex-row items-center justify-center py-3 rounded-2xl bg-dose-takenText gap-2">
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Taken
                  </Text>
                </View>
              )}

              {/* DUE NOW — Mark as Taken + Skip */}
              {uiStatus === "due" && (
                <>
                  <TouchableOpacity
                    onPress={() => handleMarkTaken(log)}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-2xl bg-dark gap-2">
                    <Feather name="check-circle" size={16} color="#fff" />
                    <Text
                      className="text-white text-sm"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Mark as Taken
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleSkip(log)}
                    className="px-5 py-3 rounded-2xl border border-dose-dueText items-center justify-center">
                    <Text
                      className="text-dose-dueText text-sm"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Skip
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* MISSED — Mark as Taken (late) */}
              {uiStatus === "missed" && (
                <>
                  <TouchableOpacity
                    onPress={() => handleMarkTaken(log)}
                    className="flex-1 flex-row items-center justify-center py-3 rounded-2xl gap-2"
                    style={{ backgroundColor: "#EDE9FE" }}>
                    <Feather name="check-circle" size={16} color="#9333EA" />
                    <Text
                      style={{
                        color: "#9333EA",
                        fontSize: 13,
                        fontFamily: "Fraunces_700Bold",
                      }}>
                      Mark as Taken
                    </Text>
                  </TouchableOpacity>
                  <View className="px-4 py-3 rounded-2xl items-center justify-center bg-[#fee2e2]">
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 12,
                        fontFamily: "Fraunces_700Bold",
                      }}>
                      MISSED
                    </Text>
                  </View>
                </>
              )}

              {/* UPCOMING */}
              {uiStatus === "upcoming" && (
                <View className="flex-1 flex-row items-center justify-between py-3 px-4 rounded-2xl border border-[#ddd6fe]">
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
                </View>
              )}

              {/* ── FIX #1: SKIPPED — undo resets to UPCOMING, not TAKEN ── */}
              {uiStatus === "skipped" && (
                <TouchableOpacity
                  onPress={() => handleUndoSkip(log)}
                  className="flex-1 flex-row items-center justify-between py-3 px-4 rounded-2xl border border-[#e5e7eb]">
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Skipped — tap to undo
                  </Text>
                  <Feather name="rotate-ccw" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
