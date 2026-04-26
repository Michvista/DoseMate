// app/(tabs)/stats.tsx
import AdherenceCard from "@/components/stats/AdherenceCard";
import BadgeCard from "@/components/stats/BadgeCard";
import CalendarCard from "@/components/stats/CalendarCard";
import StreakCard from "@/components/stats/StreakCard";
import { useStats } from "@/lib/hooks/useStats";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, ScrollView, View } from "react-native";

// Days needed for the "Elite Patient Badge" — customise freely
const BADGE_TARGET_STREAK = 7;

const Page = () => {
  const { stats, loading } = useStats();

  // How many more consecutive days until the badge unlocks
  const streak = stats?.streak ?? 0;
  const daysLeft = Math.max(0, BADGE_TARGET_STREAK - streak);
  const badgeUnlocked = streak >= BADGE_TARGET_STREAK;

  // Weekly adherence — count of days this week where accuracy > 0
  // We treat each day in dailyStats that has accuracy > 0 as "an adherence day"
  const adherentDays = (stats?.dailyStats ?? []).filter(
    (d) => d.accuracy > 0,
  ).length;

  return (
    <LinearGradient
      colors={["#E9D5FF", "#F3E8FF", "#ffffff"]}
      locations={[0, 0.25, 1]}
      style={{ flex: 1 }}>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#9333EA" size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 pt-12"
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}>
          <StreakCard
            streak={streak}
            // percent change vs last week — backend doesn't track this yet, show 0
            percentChange={0}
            message={
              streak > 0
                ? streak >= BADGE_TARGET_STREAK
                  ? "You've unlocked the Elite Patient Badge! 🏆"
                  : `Keep it up, DoseMate champion!`
                : "Take your first dose to start your streak!"
            }
          />

          <AdherenceCard
            percentage={stats?.weeklyAccuracy ?? 0}
            daysCount={adherentDays}
            goalMet={(stats?.weeklyAccuracy ?? 0) === 100}
          />

          {/* CalendarCard fetches its own month data */}
          <CalendarCard />

          <BadgeCard
            title="Elite Patient Badge"
            description={
              badgeUnlocked
                ? "Badge unlocked! You maintained perfect adherence. 🏅"
                : daysLeft === 1
                  ? "Just 1 more day of 100% adherence to unlock!"
                  : `Maintain 100% adherence for ${daysLeft} more days to unlock.`
            }
          />
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default Page;
