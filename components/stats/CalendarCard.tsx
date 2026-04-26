// components/stats/CalendarCard.tsx
// Full/partial/missed status is now CALCULATED from real dose logs.
//
// Logic per day:
//   full    → all scheduled doses are TAKEN
//   partial → at least 1 TAKEN but not all
//   missed  → 0 TAKEN and at least 1 MISSED/SKIPPED (day is in the past)
//   none    → no logs for that day, or all UPCOMING (future)

import { useGuest } from "@/lib/context/GuestContext";
import { API_BASE_URL } from "@/lib/api/config";
import { APIDoseLog } from "@/lib/api/types";
import { Feather } from "@expo/vector-icons";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type DayStatus = "full" | "missed" | "partial" | "none";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const getMondayIndex = (date: Date) => (getDay(date) + 6) % 7;

/** Fetch all dose logs for a given month from the backend */
async function fetchMonthLogs(
  guestId: string,
  year: number,
  month: number, // 0-indexed
): Promise<APIDoseLog[]> {
  const start = format(new Date(year, month, 1), "yyyy-MM-dd");
  const end = format(new Date(year, month + 1, 0), "yyyy-MM-dd"); // last day
  const res = await fetch(
    `${API_BASE_URL}/dose-logs?dateFrom=${start}&dateTo=${end}`,
    { headers: { "x-guest-id": guestId } },
  );
  if (!res.ok) return [];
  return res.json();
}

/**
 * Calculate status for every day in the month from the log array.
 * Returns a map keyed by "yyyy-MM-dd".
 */
function buildStatusMap(
  logs: APIDoseLog[],
  year: number,
  month: number,
): Record<string, DayStatus> {
  const map: Record<string, DayStatus> = {};
  const today = new Date();

  // Group logs by date key
  const byDay: Record<string, APIDoseLog[]> = {};
  for (const log of logs) {
    const key = format(new Date(log.scheduledTime), "yyyy-MM-dd");
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(log);
  }

  const allDays = eachDayOfInterval({
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0),
  });

  for (const day of allDays) {
    // Future days are always "none"
    if (day > today) {
      map[format(day, "yyyy-MM-dd")] = "none";
      continue;
    }

    const key = format(day, "yyyy-MM-dd");
    const dayLogs = byDay[key] ?? [];

    if (dayLogs.length === 0) {
      map[key] = "none";
      continue;
    }

    const taken = dayLogs.filter((l) => l.status === "TAKEN").length;
    const total = dayLogs.filter((l) => l.status !== "UPCOMING").length;
    const scheduled = dayLogs.length;

    if (taken === 0) {
      map[key] = "missed";
    } else if (taken === scheduled) {
      map[key] = "full";
    } else {
      map[key] = "partial";
    }
  }

  return map;
}

const CalendarCard = () => {
  const { guestId } = useGuest();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [statusMap, setStatusMap] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(false);

  // Fetch logs whenever the displayed month changes
  useEffect(() => {
    if (!guestId) return;
    let cancelled = false;
    setLoading(true);
    fetchMonthLogs(guestId, currentMonth.getFullYear(), currentMonth.getMonth())
      .then((logs) => {
        if (!cancelled) {
          setStatusMap(
            buildStatusMap(
              logs,
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
            ),
          );
        }
      })
      .catch(() => {}) // fail silently — calendar stays empty
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [guestId, currentMonth]);

  // ── Build calendar grid ──────────────────────────────────────────────────
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getMondayIndex(monthStart);

  const paddedDays: (Date | null)[] = [
    ...Array(startPadding).fill(null),
    ...allDays,
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek.length < 7) lastWeek.push(null);

  const getStatus = (date: Date): DayStatus =>
    statusMap[format(date, "yyyy-MM-dd")] ?? "none";

  return (
    <View className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm">
      {/* Month navigation header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text
          className="text-lg text-dark"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <View className="flex-row gap-1">
          <Pressable
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-light1 items-center justify-center">
            <Feather name="chevron-left" size={16} color="#9333EA" />
          </Pressable>
          <Pressable
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-full bg-light1 items-center justify-center">
            <Feather name="chevron-right" size={16} color="#9333EA" />
          </Pressable>
        </View>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <ActivityIndicator color="#9333EA" size="small" />
        </View>
      )}

      {/* Day-of-week labels */}
      <View className="flex-row mb-2">
        {DAY_LABELS.map((d) => (
          <View key={d} className="flex-1 items-center">
            <Text className="text-[10px] text-gray-400 tracking-wide">{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row mb-1">
          {week.map((date, di) => {
            if (!date)
              return <View key={di} className="flex-1 items-center h-10" />;

            const status = getStatus(date);
            const isToday = isSameDay(date, today);
            const inMonth = isSameMonth(date, currentMonth);

            const circleClass = isToday
              ? "bg-tabs-100"
              : status === "full"
                ? "bg-[#C4B5FD]"
                : status === "partial"
                  ? "bg-[#EDE9FE]"
                  : status === "missed"
                    ? "bg-white border border-slate-200"
                    : "bg-transparent";

            const textClass = isToday
              ? "text-white font-extrabold"
              : status === "full" || status === "partial"
                ? "text-[#7c3aed] font-semibold"
                : status === "missed"
                  ? "text-gray-400"
                  : inMonth
                    ? "text-gray-400"
                    : "text-gray-200";

            return (
              <View key={di} className="flex-1 items-center">
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${circleClass}`}>
                  <Text
                    className={`text-[13px] ${textClass}`}
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    {format(date, "d")}
                  </Text>
                </View>
                {status === "partial" && !isToday && (
                  <View className="w-4 h-[2px] rounded-full bg-[#C4B5FD] mt-[2px]" />
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View className="flex-row justify-center gap-4 mt-3 pt-3 border-t border-light1">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD]" />
          <Text className="text-[10px] text-gray-400 tracking-wide">FULL</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200" />
          <Text className="text-[10px] text-gray-400 tracking-wide">
            MISSED
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-4 h-[2px] rounded-full bg-[#C4B5FD]" />
          <Text className="text-[10px] text-gray-400 tracking-wide">
            PARTIAL
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CalendarCard;
