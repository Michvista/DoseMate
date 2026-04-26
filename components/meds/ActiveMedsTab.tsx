// components/meds/ActiveMedsTab.tsx
import { MedicationIcons } from "@/lib/MedicationIcons";
import { APIDoseLog } from "@/lib/api/types";
import { useDoseLogs } from "@/lib/hooks/useDoseLogs";
import { useMedications } from "@/lib/hooks/useMedications";
import { Entypo, Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Maps API medication type → display color
const TYPE_COLORS: Record<string, string> = {
  pill: "#9333EA",
  capsule: "#EF4444",
  liquid: "#3B82F6",
  injection: "#F59E0B",
  patch: "#10B981",
};

// Status badge styles for dose logs
const LOG_STATUS: Record<
  string,
  { bg: string; text: string; label: string; hex: string }
> = {
  TAKEN: {
    bg: "bg-green-100",
    text: "text-green-600",
    label: "TAKEN",
    hex: "#10B981",
  },
  MISSED: {
    bg: "bg-red-100",
    text: "text-red-500",
    label: "MISSED",
    hex: "#EF4444",
  },
  SKIPPED: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    label: "SKIPPED",
    hex: "#9CA3AF",
  },
  UPCOMING: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    label: "UPCOMING",
    hex: "#9333EA",
  },
};

interface Props {
  onViewAllPress: () => void;
}

export const ActiveMedsTab = ({ onViewAllPress }: Props) => {
  const { medications, loading: medsLoading } = useMedications();
  const today = new Date();
  const { logs, loading: logsLoading, markDose } = useDoseLogs(today);

  const activeMeds = medications
    .filter((m) => m.status === "Active")
    .slice(0, 3);

  // Today's completed/missed logs for recent activity (exclude upcoming, newest first)
  const recentLogs = logs
    .filter((l) => l.status !== "UPCOMING")
    .sort(
      (a, b) =>
        new Date(b.scheduledTime).getTime() -
        new Date(a.scheduledTime).getTime(),
    )
    .slice(0, 5);

  const handleMarkTaken = (log: APIDoseLog) => {
    markDose(log._id, "TAKEN").catch((err) =>
      Alert.alert("Error", err.message),
    );
  };

  if (medsLoading || logsLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#9333EA" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 12 }}>
      {/* Active meds preview (first 3) */}
      {activeMeds.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Feather name="inbox" size={32} color="#C4B5FD" />
          <Text
            className="mt-3 text-gray-400 text-sm text-center"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            No active medications.{"\n"}Tap + to add one.
          </Text>
        </View>
      ) : (
        activeMeds.map((med) => {
          const color = TYPE_COLORS[med.type] ?? "#9333EA";
          const Icon =
            (MedicationIcons as any)[med.type] ?? (MedicationIcons as any).pill;
          return (
            <View
              key={med._id}
              className="bg-white rounded-2xl p-4 flex-row items-center gap-3"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}>
              {/* Icon */}
              <View
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: color + "20" }}>
                <Icon size={20} color={color} />
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text
                  className="text-base text-dark"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {med.name}
                </Text>
                <Text
                  className="text-xs text-gray-400 mt-0.5"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {med.dosage.value}
                  {med.dosage.unit} · {med.scheduleType}
                </Text>
                {/* Time chips */}
                <View className="flex-row gap-1 mt-1 flex-wrap">
                  {med.times.map((t, i) => (
                    <View
                      key={i}
                      className="bg-purple-50 px-2 py-0.5 rounded-full">
                      <Text
                        style={{
                          fontFamily: "Fraunces_400Regular",
                          color: "#9333EA",
                          fontSize: 9,
                        }}>
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Status badge */}
              <View className="items-end gap-1">
                <View
                  className={`px-2 py-0.5 rounded-full ${med.status === "Active" ? "bg-green-100" : "bg-gray-100"}`}>
                  <Text
                    className={`text-[10px] ${med.status === "Active" ? "text-green-600" : "text-gray-500"}`}
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {med.status.toUpperCase()}
                  </Text>
                </View>
                <Text
                  className="text-[10px] text-gray-400"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  Next: {med.times[0] ?? "--"}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {/* View all button */}
      <TouchableOpacity
        onPress={onViewAllPress}
        className="flex-row items-center justify-center gap-2 py-3 rounded-2xl"
        style={{ backgroundColor: "#EDE9FE" }}>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Fraunces_700Bold",
            color: "#9333EA",
          }}>
          View All Medications
        </Text>
        <Feather name="arrow-right" size={14} color="#9333EA" />
      </TouchableOpacity>

      {/* Recent Activity */}
      <View>
        <View className="flex-row items-center justify-between px-1 py-2 pb-3">
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              color: "#1A0A2E",
              fontSize: 15,
            }}>
            Recent Activity
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontFamily: "Fraunces_400Regular",
            }}>
            TODAY, {format(today, "MMM d").toUpperCase()}
          </Text>
        </View>

        {recentLogs.length === 0 ? (
          <View
            className="bg-white rounded-2xl p-6 items-center"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}>
            <Text
              className="text-gray-400 text-sm"
              style={{ fontFamily: "Fraunces_400Regular" }}>
              No doses logged yet today
            </Text>
          </View>
        ) : (
          <View
            className="bg-white rounded-2xl p-2 flex-col gap-1"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}>
            {recentLogs.map((log) => {
              const s = LOG_STATUS[log.status] ?? LOG_STATUS.UPCOMING;
              // medicationId may be populated (object) or just an ID string
              const medName =
                typeof log.medicationId === "object"
                  ? (log.medicationId as any).name
                  : "Medication";
              const medDosage =
                typeof log.medicationId === "object"
                  ? `${(log.medicationId as any).dosage?.value}${(log.medicationId as any).dosage?.unit}`
                  : "";

              return (
                <View
                  key={log._id}
                  className="rounded-2xl p-3 flex-row items-center gap-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: s.hex + "20" }}>
                    {log.status === "TAKEN" ? (
                      <Feather name="check" size={18} color={s.hex} />
                    ) : (
                      <Entypo name="cross" size={18} color={s.hex} />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm text-dark"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      {medName}{" "}
                      <Text
                        className="text-xs text-gray-400"
                        style={{ fontFamily: "Fraunces_400Regular" }}>
                        ({medDosage})
                      </Text>
                    </Text>
                    <Text
                      className="text-xs text-gray-400 mt-0.5"
                      style={{ fontFamily: "Fraunces_400Regular" }}>
                      {log.status === "TAKEN"
                        ? "Taken"
                        : log.status === "MISSED"
                          ? "Missed"
                          : "Skipped"}{" "}
                      at {format(new Date(log.scheduledTime), "hh:mm a")}
                    </Text>
                  </View>

                  {/* Tapping MISSED → marks as TAKEN */}
                  {log.status === "MISSED" ? (
                    <TouchableOpacity
                      onPress={() => handleMarkTaken(log)}
                      style={{
                        backgroundColor: "#EDE9FE",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}>
                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: "Fraunces_700Bold",
                          color: "#9333EA",
                        }}>
                        MARK TAKEN
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
                      <Text
                        className={`text-[10px] ${s.text}`}
                        style={{ fontFamily: "Fraunces_700Bold" }}>
                        {s.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
