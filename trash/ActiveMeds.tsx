import { MedicationIcons } from "@/lib/MedicationIcons";
import { Entypo, Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Types ─────────────────────────────────────────────────────
type Medication = {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  nextDose: string;
  color: string;
  status: "active" | "paused" | "completed";
  icon?: string;
};

type HistoryEntry = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  date: string;
  taken: boolean;
};

type RecentActivity = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: "taken" | "missed";
};

// ── Dummy data ────────────────────────────────────────────────
const ACTIVE_MEDS: Medication[] = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500",
    unit: "mg",
    frequency: "Twice daily",
    nextDose: "08:00 PM",
    color: "#10B981",
    status: "active",
    icon: "pill",
  },
  {
    id: "2",
    name: "Vitamin C",
    dosage: "1000",
    unit: "mg",
    frequency: "Once daily",
    nextDose: "08:00 AM",
    color: "#F97316",
    status: "active",
    icon: "pill",
  },
  {
    id: "3",
    name: "Amoxicillin",
    dosage: "250",
    unit: "mg",
    frequency: "Three times",
    nextDose: "02:00 PM",
    color: "#8B5CF6",
    status: "paused",
    icon: "capsule",
  },
  {
    id: "4",
    name: "Omega-3",
    dosage: "1",
    unit: "cap",
    frequency: "Once daily",
    nextDose: "09:00 PM",
    color: "#60A5FA",
    status: "active",
    icon: "pill",
  },
  {
    id: "5",
    name: "Metformin",
    dosage: "500",
    unit: "mg",
    frequency: "Twice daily",
    nextDose: "—",
    color: "#F43F5E",
    status: "completed",
    icon: "pill",
  },
];

const RECENT_ACTIVITY: RecentActivity[] = [
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

const HISTORY: HistoryEntry[] = [
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
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Yesterday",
    taken: true,
  },
  {
    id: "5",
    name: "Vitamin C",
    dosage: "1000mg",
    time: "08:00 AM",
    date: "Yesterday",
    taken: true,
  },
  {
    id: "6",
    name: "Omega-3",
    dosage: "1 cap",
    time: "09:00 PM",
    date: "Yesterday",
    taken: false,
  },
  {
    id: "7",
    name: "Paracetamol",
    dosage: "500mg",
    time: "08:00 AM",
    date: "Apr 4, 2026",
    taken: true,
  },
];

const TABS = ["Active Meds", "Dose History"];

const STATUS_COLORS = {
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

// ── Tab bar ───────────────────────────────────────────────────
const TabBar = ({
  tabs,
  activeIndex,
  onPress,
}: {
  tabs: string[];
  activeIndex: number;
  onPress: (i: number) => void;
}) => {
  // Store measured x + width per tab
  const [layouts, setLayouts] = useState<{ x: number; width: number }[]>(
    tabs.map(() => ({ x: 0, width: 0 })),
  );
  const [measured, setMeasured] = useState(false);

  // Single Animated.Value for the underline position
  const anim = useRef(new Animated.Value(0)).current;

  // Run animation only after all tabs have been measured
  const runAnim = (
    index: number,
    currentLayouts: { x: number; width: number }[],
  ) => {
    if (!currentLayouts.every((l) => l.width > 0)) return;
    Animated.spring(anim, {
      toValue: currentLayouts[index].x,
      useNativeDriver: true, // translateX can use native driver — smoother
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const onLayout = (e: LayoutChangeEvent, i: number) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[i] = { x, width };
      // Once all tabs have real widths, run initial animation
      if (next.every((l) => l.width > 0) && !measured) {
        setMeasured(true);
        runAnim(activeIndex, next);
      }
      return next;
    });
  };

  const handlePress = (i: number) => {
    onPress(i);
    runAnim(i, layouts);
  };

  // Underline width follows the active tab's measured width
  const underlineWidth = layouts[activeIndex]?.width ?? 0;

  return (
    <View className="border-b border-gray-100">
      <View className="flex-row px-4">
        {tabs.map((label, i) => (
          <TouchableOpacity
            key={i}
            onLayout={(e) => onLayout(e, i)}
            onPress={() => handlePress(i)}
            className="mr-6 pb-3 pt-1">
            <Text
              className={`text-base font-bold  ${
                activeIndex === i ? "text-dark" : "text-gray-400"
              }`}
              style={{ fontFamily: "Fraunces_700Bold" }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Underline pill — translates on X axis, width snaps to active tab */}
      <Animated.View
        className="absolute bottom-0 h-[3px] rounded-full bg-tabs-100"
        style={{
          width: underlineWidth,
          transform: [{ translateX: anim }],
        }}
      />
    </View>
  );
};

// ── Active Meds tab content ───────────────────────────────────
const ActiveMedsTab = () => (
  <ScrollView
    className="flex-1 px-4 pt-4"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 120, gap: 12 }}>
    {ACTIVE_MEDS.map((med) => {
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
          {/* Color dot */}
          <View
            className="w-11 h-11 rounded-xl items-center justify-center"
            style={{ backgroundColor: med.color + "20" }}>
            {/* <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: med.color }}
            /> */}
            <View>
              {(() => {
                const Icon =
                  (MedicationIcons as any)[med.icon || "pill"] ??
                  (MedicationIcons as any).pill;
                return <Icon size={20} color={med.color} />;
              })()}
            </View>
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
            <View className="flex flex-row gap-3 items-center p-2">
              <Feather name="edit-2" size={14} color="#9333EA" />
              <Feather name="trash-2" size={14} color="red" />
            </View>
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
            {med.status === "active" && (
              <Text
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                Next: {med.nextDose}
              </Text>
            )}
          </View>
        </View>
      );
    })}

    <View>
      <View className="flex flex-row items-center justify-between px-3 py-2 pb-6">
        <Text style={{ fontFamily: "Fraunces_700Bold" }}>Recent Activity</Text>
        <Text>TODAY, OCT 24</Text>
      </View>
      <View
        className="bg-white rounded-2xl p-4 flex-col items-center gap-3"
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
              className="bg-white rounded-2xl p-4 flex flex-row items-center gap-3">
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${s.bg}`}
                style={{ backgroundColor: s.hex + "20" }}>
                <View>
                  {rec.status === "taken" ? (
                    <Feather name="check" size={20} color={s.hex} />
                  ) : (
                    <Entypo name="cross" size={20} color={s.hex} />
                  )}
                </View>
              </View>

              <View className="flex-1">
                <Text
                  className="text-base font-bold text-dark"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {rec.name} ({rec.dosage})
                </Text>
                <Text
                  className="text-xs text-gray-400 mt-0.5"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  Taken at {rec.time}
                </Text>
              </View>

              <View className="items-end gap-1">
                <View className={`px-2 py-0.5 rounded-full ${s.bg}`}>
                  <Text
                    className={`text-[10px] font-bold ${s.text}`}
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {s.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  </ScrollView>
);

// ── Dose History tab content ──────────────────────────────────
const HistoryTab = () => {
  // Group entries by date
  const grouped = HISTORY.reduce<Record<string, HistoryEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    },
    {},
  );

  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 16 }}>
      {Object.entries(grouped).map(([date, entries]) => (
        <View key={date}>
          <Text
            className="text-xs font-bold text-gray-400 tracking-widest mb-2 uppercase"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            {date}
          </Text>
          <View className="gap-2">
            {entries.map((e) => (
              <View
                key={e.id}
                className="bg-white rounded-2xl px-4 py-3 flex-row items-center gap-3"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    e.taken ? "bg-dose-taken" : "bg-dose-idle"
                  }`}>
                  <Feather
                    name={e.taken ? "check" : "x"}
                    size={14}
                    color={e.taken ? "#10B981" : "#F43F5E"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-bold text-dark"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {e.name}
                  </Text>
                  <Text
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    {e.dosage}
                  </Text>
                </View>
                <Text
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {e.time}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// ── Page ─────────────────────────────────────────────────────
const Page = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View className="w-full flex-1 bg-[#F8F6FF] pt-14">
      {/* Header */}
      <View className="px-4 pb-4 flex-row items-center justify-between">
        <Text
          className="text-2xl text-dark"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          My Medications
        </Text>
        <View className="w-9 h-9 rounded-full bg-light1 items-center justify-center">
          <Feather name="plus" size={18} color="#9333EA" />
        </View>
      </View>
      <View className="w-full flex flex-row items-center justify-center">
        <TabBar tabs={TABS} activeIndex={activeTab} onPress={setActiveTab} />
      </View>

      {/* Swap content based on active tab */}
      {activeTab === 0 ? <ActiveMedsTab /> : <HistoryTab />}
    </View>
  );
};

export default Page;
