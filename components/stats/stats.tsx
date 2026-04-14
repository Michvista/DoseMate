import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, View } from "react-native";
import AdherenceCard from "@/components/stats/AdherenceCard";
import BadgeCard from "@/components/stats/BadgeCard";
import CalendarCard from "@/components/stats/CalendarCard";
import StreakCard from "@/components/stats/StreakCard";

const Page = () => {
  return (
    // expo-linear-gradient for the purple→white background
    <LinearGradient
      colors={["#E9D5FF", "#F3E8FF", "#ffffff"]}
      locations={[0, 0.3, 1]}
      style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 pt-12"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>

        <StreakCard
          streak={12}
          percentChange={2}
          message="Keep it up, DoseMate champion!"
        />

        <AdherenceCard
          percentage={100}
          daysCount={5}
          goalMet={true}
        />

        <CalendarCard />

        <BadgeCard
          title="Elite Patient Badge"
          description="Maintain 100% adherence for 4 more days to unlock."
        />

      </ScrollView>
    </LinearGradient>
  );
};

export default Page;
