// components/meds/DoseHistoryTab.tsx
import { APIDoseLog } from "@/lib/api/types";
import { useDoseLogs } from "@/lib/hooks/useDoseLogs";
import { useStats } from "@/lib/hooks/useStats";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const DoseHistoryTab = () => {
  const { logs, loading, markDose } = useDoseLogs();
  const { stats } = useStats();

  // 7-day bar chart data from the backend
  // dailyStats is ordered Mon→Sun with accuracy 0-100 per day
  const dailyStats = stats?.dailyStats ?? [];

  // Today's index in the week (0=Mon … 6=Sun)
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Group completed/missed logs by readable date, newest first
  const grouped = logs
    .filter((l) => l.status !== "UPCOMING")
    .reduce<Record<string, APIDoseLog[]>>((acc, log) => {
      const key = format(new Date(log.scheduledTime), "EEEE, MMM d");
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) =>
      new Date(grouped[b][0].scheduledTime).getTime() -
      new Date(grouped[a][0].scheduledTime).getTime(),
  );

  const handleMarkTaken = async (log: APIDoseLog) => {
    try {
      await markDose(log._id, "TAKEN");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#9333EA" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-3 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 16 }}>
      {/* ── Weekly accuracy card ── */}
      <View
        style={{
          backgroundColor: "#EDE9FE",
          borderRadius: 20,
          padding: 16,
          shadowColor: "#9333EA",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Fraunces_700Bold",
            color: "#9333EA",
            letterSpacing: 1,
            marginBottom: 4,
          }}>
          WEEKLY ACCURACY
        </Text>

        <View className="flex-row items-center justify-between">
          <View>
            {/* Big accuracy number */}
            <Text
              style={{
                fontSize: 44,
                fontFamily: "Fraunces_700Bold",
                color: "#1A0A2E",
                lineHeight: 48,
              }}>
              {stats?.weeklyAccuracy ?? 0}%
            </Text>

            {/* Bar chart — each bar height = that day's accuracy / 100 * 40px */}
            <View
              className="flex-row items-end gap-3 mt-2"
              style={{ height: 56 }}>
              {(dailyStats.length > 0
                ? dailyStats
                : Array(7).fill({ accuracy: 0 })
              ).map((bar, i) => {
                const height = Math.max(4, (bar.accuracy / 100) * 40);
                const isToday = i === todayIndex;
                return (
                  <View key={i} className="items-center gap-1">
                    <View
                      style={{
                        width: 8,
                        height,
                        borderRadius: 4,
                        backgroundColor: isToday
                          ? "#9333EA"
                          : bar.accuracy === 100
                            ? "#C4B5FD"
                            : bar.accuracy > 0
                              ? "#DDD6FE"
                              : "#E5E7EB",
                      }}
                    />
                  </View>
                );
              })}
            </View>

            {/* Day labels */}
            <View className="flex-row gap-3 mt-1">
              {(dailyStats.length > 0
                ? dailyStats.map((b) => b.day.slice(0, 1)) // first letter of day name
                : ["M", "T", "W", "T", "F", "S", "S"]
              ).map((day, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: 8,
                    fontFamily: "Fraunces_700Bold",
                    color: i === todayIndex ? "#9333EA" : "#9CA3AF",
                    width: 8,
                    textAlign: "center",
                  }}>
                  {day}
                </Text>
              ))}
            </View>
          </View>

          {/* Streak badge */}
          <View className="items-center gap-1">
            <View
              style={{
                backgroundColor: "#9333EA",
                borderRadius: 14,
                padding: 10,
              }}>
              <Feather name="zap" size={18} color="#fff" />
            </View>
            <Text
              style={{
                fontSize: 9,
                fontFamily: "Fraunces_700Bold",
                color: "#7C3AED",
                letterSpacing: 1,
                textAlign: "center",
              }}>
              {stats?.streak ?? 0} DAY{"\n"}STREAK
            </Text>
          </View>
        </View>

        {/* Taken / total summary */}
        {stats && stats.total > 0 && (
          <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-[#DDD6FE]">
            <View className="w-2 h-2 rounded-full bg-tabs-100" />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Fraunces_700Bold",
                color: "#7C3AED",
                letterSpacing: 1,
              }}>
              {stats.taken} OF {stats.total} DOSES TAKEN THIS WEEK
            </Text>
          </View>
        )}
      </View>

      {/* ── Empty state ── */}
      {sortedDates.length === 0 && (
        <View className="items-center justify-center py-16">
          <Feather name="clipboard" size={32} color="#C4B5FD" />
          <Text
            className="mt-3 text-gray-400 text-sm"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            No dose history yet
          </Text>
        </View>
      )}

      {/* ── Grouped history entries ── */}
      {sortedDates.map((dateLabel) => {
        const entries = grouped[dateLabel];
        const takenCount = entries.filter((e) => e.status === "TAKEN").length;
        // Per-group accuracy colour
        const groupPct =
          entries.length > 0
            ? Math.round((takenCount / entries.length) * 100)
            : 0;

        return (
          <View key={dateLabel}>
            {/* Date header */}
            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Fraunces_700Bold",
                  color: "#1A0A2E",
                }}>
                {dateLabel}
              </Text>
              <View className="flex-row items-center gap-2">
                {/* Mini accuracy pill */}
                <View
                  style={{
                    backgroundColor:
                      groupPct === 100
                        ? "#D1FAE5"
                        : groupPct >= 50
                          ? "#EDE9FE"
                          : "#FEE2E2",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 20,
                  }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "Fraunces_700Bold",
                      color:
                        groupPct === 100
                          ? "#10B981"
                          : groupPct >= 50
                            ? "#9333EA"
                            : "#EF4444",
                    }}>
                    {groupPct}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  {takenCount}/{entries.length} doses
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              {entries.map((log) => {
                const taken = log.status === "TAKEN";
                const missed = log.status === "MISSED";
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
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      shadowColor: "#000",
                      shadowOpacity: 0.04,
                      shadowRadius: 8,
                      elevation: 2,
                    }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: taken
                          ? "#D1FAE5"
                          : missed
                            ? "#FEE2E2"
                            : "#F3F4F6",
                      }}>
                      <Feather
                        name={taken ? "check" : missed ? "x" : "clock"}
                        size={15}
                        color={
                          taken ? "#10B981" : missed ? "#EF4444" : "#9CA3AF"
                        }
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Fraunces_700Bold",
                          color: "#1A0A2E",
                        }}>
                        {medName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          fontFamily: "Fraunces_400Regular",
                          marginTop: 1,
                        }}>
                        {medDosage} · Scheduled{" "}
                        {format(new Date(log.scheduledTime), "hh:mm a")}
                      </Text>
                    </View>

                    {missed ? (
                      <TouchableOpacity
                        onPress={() => handleMarkTaken(log)}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 20,
                          backgroundColor: "#EDE9FE",
                        }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Fraunces_700Bold",
                            color: "#9333EA",
                            letterSpacing: 0.5,
                          }}>
                          MARK TAKEN
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 20,
                          backgroundColor: taken ? "#D1FAE5" : "#F3F4F6",
                        }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Fraunces_700Bold",
                            color: taken ? "#10B981" : "#9CA3AF",
                            letterSpacing: 0.5,
                          }}>
                          {taken ? "TAKEN ✓" : "SKIPPED"}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};
