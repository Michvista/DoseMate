import { MedicationIcons } from "@/lib/MedicationIcons";
import { Entypo, Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ACTIVE_MEDS, RECENT_ACTIVITY } from "../../lib/data";
import { STATUS_COLORS } from "../../lib/types";

interface ActiveMedsTabProps {
  onViewAllPress: () => void;
}

export const ActiveMedsTab = ({ onViewAllPress }: ActiveMedsTabProps) => {
  // Show only "active" status meds on this tab
  const activeMeds = ACTIVE_MEDS.filter((m) => m.status === "active");

  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 12 }}>
      {/* Active meds list (first 3 only, teaser) */}
      {activeMeds.slice(0, 3).map((med) => {
        const s = STATUS_COLORS[med.status];
        return (
          <View
            key={med.id}
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
              style={{ backgroundColor: med.color + "20" }}>
              {(() => {
                const Icon =
                  (MedicationIcons as any)[med.icon || "pill"] ??
                  (MedicationIcons as any).pill;
                return <Icon size={20} color={med.color} />;
              })()}
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text
                className="text-base font-bold text-dark"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                {med.name}
              </Text>
              <Text
                className="text-xs text-gray-400 mt-0.5"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                {med.dosage}
                {med.unit} · {med.frequency}
              </Text>
            </View>

            {/* Right side */}
            <View className="items-end gap-1">
              <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
                <Text
                  className={`text-[10px] font-bold ${s.text}`}
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {s.label}
                </Text>
              </View>
              <Text
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                Next: {med.nextDose}
              </Text>
            </View>
          </View>
        );
      })}

      {/* View all medications button */}
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
        <View className="flex flex-row items-center justify-between px-1 py-2 pb-3">
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
            TODAY
          </Text>
        </View>
        <View
          className="bg-white rounded-2xl p-2 flex-col gap-1"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}>
          {RECENT_ACTIVITY.map((rec) => {
            const s = STATUS_COLORS[rec.status];
            return (
              <View
                key={rec.id}
                className="rounded-2xl p-3 flex flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: (s.hex ?? "#000") + "20" }}>
                  {rec.status === "taken" ? (
                    <Feather name="check" size={18} color={s.hex} />
                  ) : (
                    <Entypo name="cross" size={18} color={s.hex} />
                  )}
                </View>

                <View className="flex-1">
                  <Text
                    className="text-sm font-bold text-dark"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {rec.name}{" "}
                    <Text
                      className="text-xs text-gray-400"
                      style={{ fontFamily: "Fraunces_400Regular" }}>
                      ({rec.dosage})
                    </Text>
                  </Text>
                  <Text
                    className="text-xs text-gray-400 mt-0.5"
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    {rec.status === "taken" ? "Taken" : "Missed"} at {rec.time}
                  </Text>
                </View>

                <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
                  <Text
                    className={`text-[10px] font-bold ${s.text}`}
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {s.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
