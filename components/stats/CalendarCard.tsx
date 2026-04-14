import {
  eachDayOfInterval,    // generates every date between two dates
  endOfMonth,           // last day of a given month
  format,               // formats a Date into a string
  getDay,               // gets day of week (0=Sun, 6=Sat)
  isSameDay,            // checks if two dates are the same calendar day
  isSameMonth,          // checks if two dates are in the same month
  startOfMonth,         // first day of a given month
  subMonths,            // subtracts months from a date
  addMonths,            // adds months to a date
} from "date-fns";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type DayStatus = "full" | "missed" | "partial" | "none";

// ── Dummy status data ─────────────────────────────────────────
// Keyed by "yyyy-MM-dd". In production, fetch this from your backend.
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth(); // 0-indexed month

const STATUS_DATA: Record<string, DayStatus> = {
  // Full days — all doses taken
  [format(new Date(y, m,  1), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  2), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  3), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  4), "yyyy-MM-dd")]: "partial",
  [format(new Date(y, m,  5), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  6), "yyyy-MM-dd")]: "missed",
  [format(new Date(y, m,  7), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  8), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m,  9), "yyyy-MM-dd")]: "partial",
  [format(new Date(y, m, 10), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 11), "yyyy-MM-dd")]: "missed",
  [format(new Date(y, m, 12), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 13), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 14), "yyyy-MM-dd")]: "partial",
  [format(new Date(y, m, 15), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 16), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 17), "yyyy-MM-dd")]: "missed",
  [format(new Date(y, m, 18), "yyyy-MM-dd")]: "full",
  [format(new Date(y, m, 19), "yyyy-MM-dd")]: "partial",
  [format(new Date(y, m, 20), "yyyy-MM-dd")]: "full",
  // days after today stay "none" (future)
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// date-fns getDay() → 0=Sun, 1=Mon…6=Sat
// We want 0=Mon so we shift: (0+6)%7=6(Sun), (1+6)%7=0(Mon), etc.
const getMondayIndex = (date: Date) => (getDay(date) + 6) % 7;

const CalendarCard = () => {
  const today = new Date();

  // currentMonth drives which month is displayed; starts as this month
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  // Build an array of every day in the displayed month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const allDays    = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // How many empty slots to add before the 1st so Monday is always column 0
  const startPadding = getMondayIndex(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array(startPadding).fill(null), // null = empty cell
    ...allDays,
  ];

  // Slice paddedDays into chunks of 7 (one per week row)
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  // Make the last row exactly 7 cells wide
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek.length < 7) lastWeek.push(null);

  // Look up a date's status, default to "none" if not in STATUS_DATA
  const getStatus = (date: Date): DayStatus =>
    STATUS_DATA[format(date, "yyyy-MM-dd")] ?? "none";

  return (
    <View className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm">

      {/* ── Month navigation header ── */}
      <View className="flex-row justify-between items-center mb-4">
        <Text
          className="text-lg text-dark"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          {format(currentMonth, "MMMM yyyy")}  {/* e.g. "April 2026" */}
        </Text>
        <View className="flex-row gap-1">
          {/* Go back one month */}
          <Pressable
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-light1 items-center justify-center">
            <Feather name="chevron-left" size={16} color="#9333EA" />
          </Pressable>
          {/* Go forward one month */}
          <Pressable
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-light1 items-center justify-center">
            <Feather name="chevron-right" size={16} color="#9333EA" />
          </Pressable>
        </View>
      </View>

      {/* ── Day-of-week labels row ── */}
      <View className="flex-row mb-2">
        {DAY_LABELS.map((d) => (
          <View key={d} className="flex-1 items-center">
            <Text className="text-[10px] text-gray-400 tracking-wide">{d}</Text>
          </View>
        ))}
      </View>

      {/* ── Calendar grid ── */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row mb-1">
          {week.map((date, di) => {

            // null cells = padding before/after month days
            if (!date) return <View key={di} className="flex-1 items-center h-10" />;

            const status  = getStatus(date);
            const isToday = isSameDay(date, today);
            const inMonth = isSameMonth(date, currentMonth); // false for overflow padding

            // Circle background — today overrides all status colors
            const circleClass = isToday
              ? "bg-tabs-100"                          // solid purple circle
              : status === "full"
                ? "bg-[#C4B5FD]"                       // light purple fill
                : status === "partial"
                  ? "bg-[#EDE9FE]"                     // very light purple
                  : status === "missed"
                    ? "bg-white border border-slate-200" // white with border
                    : "bg-transparent";                 // no background for future/empty

            // Number text color
            const textClass = isToday
              ? "text-white font-extrabold"
              : status === "full" || status === "partial"
                ? "text-[#7c3aed] font-semibold"
                : status === "missed"
                  ? "text-gray-400"
                  : inMonth ? "text-gray-400" : "text-gray-200"; // dimmed if out of month

            return (
              <View key={di} className="flex-1 items-center">
                <View className={`w-9 h-9 rounded-full items-center justify-center ${circleClass}`}>
                  <Text
                    className={`text-[13px] ${textClass}`}
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    {format(date, "d")} {/* just the day number, e.g. "6" */}
                  </Text>
                </View>
                {/* Partial indicator — a dash below the circle */}
                {status === "partial" && !isToday && (
                  <View className="w-4 h-[2px] rounded-full bg-[#C4B5FD] mt-[2px]" />
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* ── Legend ── */}
      <View className="flex-row justify-center gap-4 mt-3 pt-3 border-t border-light1">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD]" />
          <Text className="text-[10px] text-gray-400 tracking-wide">FULL</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200" />
          <Text className="text-[10px] text-gray-400 tracking-wide">MISSED</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-[2px] rounded-full bg-[#C4B5FD]" />
          <Text className="text-[10px] text-gray-400 tracking-wide">PARTIAL</Text>
        </View>
      </View>
    </View>
  );
};

export default CalendarCard;