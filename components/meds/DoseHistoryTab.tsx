import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { HISTORY } from "../../lib/data";

export const DoseHistoryTab = () => {
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekHeights = [60, 80, 45, 90, 70, 100, 75];
  const todayIndex = 6;

  const grouped = HISTORY.reduce<Record<string, typeof HISTORY>>(
    (acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    },
    {},
  );

  const doseCounts = Object.fromEntries(
    Object.entries(grouped).map(([date, entries]) => [date, entries.length]),
  );

  return (
    <ScrollView
      className="flex-1 px-3 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 16 }}>
      {/* Weekly accuracy card */}
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
            <Text
              style={{
                fontSize: 44,
                fontFamily: "Fraunces_700Bold",
                color: "#1A0A2E",
                lineHeight: 48,
              }}>
              94%
            </Text>

            {/* Mini bar chart */}
            <View
              className="flex-row items-end gap-3 mt-2"
              style={{ height: 56 }}>
              {weekDays.map((day, i) => (
                <View key={i} className="items-center gap-1">
                  <View
                    style={{
                      width: 8,
                      height: (weekHeights[i] / 100) * 40,
                      borderRadius: 4,
                      backgroundColor: i === todayIndex ? "#9333EA" : "#C4B5FD",
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Day labels */}
            <View className="flex-row gap-3 mt-1">
              {weekDays.map((day, i) => (
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
              }}>
              7 DAY STREAK
            </Text>
          </View>
        </View>
      </View>

      {/* Grouped history */}
      {Object.entries(grouped).map(([date, entries]) => (
        <View key={date}>
          {/* Date header */}
          <View className="flex-row justify-between items-center mb-2 px-1">
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fraunces_700Bold",
                color: "#1A0A2E",
              }}>
              {date}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                fontFamily: "Fraunces_400Regular",
              }}>
              {doseCounts[date]} doses
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {entries.map((e) => (
              <View
                key={e.id}
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
                    backgroundColor: e.taken ? "#D1FAE5" : "#FEE2E2",
                  }}>
                  <Feather
                    name={e.taken ? "check" : "x"}
                    size={15}
                    color={e.taken ? "#10B981" : "#EF4444"}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                    }}>
                    {e.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontFamily: "Fraunces_400Regular",
                      marginTop: 1,
                    }}>
                    {e.dosage} · Scheduled {e.time}
                  </Text>
                </View>

                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 20,
                    backgroundColor: e.taken ? "#D1FAE5" : "#FEE2E2",
                  }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "Fraunces_700Bold",
                      color: e.taken ? "#10B981" : "#EF4444",
                      letterSpacing: 0.5,
                    }}>
                    {e.taken ? "TAKEN ✓" : "MISSED ✗"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
