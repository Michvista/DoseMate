// app/(tabs)/index.tsx
import Doses from "@/components/Doses";
import SimpleCalendarStrip from "@/components/SimpleCalendarStrip";
import FirstType from "@/components/floatbtns/FirstType";
import { useDoseLogs } from "@/lib/hooks/useDoseLogs";
import { useProfile } from "@/lib/hooks/useProfile";
import { Feather, Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
  TouchableOpacity
} from "react-native";

import * as ExpoNotifications from "expo-notifications";

const Page = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const calendarRef = useRef(null);

  // ── API data ──────────────────────────────────────────────────
  const { user } = useProfile();
  const { takenCount, totalCount } = useDoseLogs(selectedDate);

  const dosesHeading = isToday(selectedDate)
    ? "Today's Doses"
    : format(selectedDate, "EEE, MMM d");

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const showFloatingFAB = scrollOffset > calendarHeight + 20 || isPanelOpen;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleCalendarLayout = (event: any) => {
    setCalendarHeight(event.nativeEvent.layout.height);
  };

  return (
    <View className="flex-1 pt-[2rem] bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center gap-5">
          <Image
            source={require("@/assets/images/Background.svg")}
            style={{ width: 40, height: 40 }}
          />
          <View>
            <Text
              className="uppercase text-gray-700 text-sm tracking-wider"
              style={{ fontFamily: "Fraunces_400Regular" }}>
              {greeting}
            </Text>
            <Text
              className="text-black"
              style={{ fontFamily: "Fraunces_700Bold", fontSize: 16 }}>
              <Text style={{ fontFamily: "Fraunces_700Bold" }}>
                {firstName}
              </Text>
              's DoseMate
            </Text>
          </View>
        </View>
        <View className="border-2 border-gray-400 rounded-full p-2">
          <Feather name="bell" size={20} />
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* Calendar strip */}
        <View className="w-full items-center" onLayout={handleCalendarLayout}>
          <SimpleCalendarStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </View>

        {/* Doses section */}
        <View className="w-full items-center">
          <View className="w-full px-6 flex-row items-center justify-between mb-1">
            <Text
              className="text-gray-700 text-xl"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              {dosesHeading}
            </Text>
            <View className="flex-row items-center bg-light1 px-3 p-2 rounded-full">
              <Text
                style={{ fontFamily: "Fraunces_700Bold" }}
                className="text-splashScreen-100 text-sm">
                {takenCount} of {totalCount} Taken
              </Text>
            </View>
          </View>
          {/* Doses component receives selectedDate and refreshes automatically */}
          <Doses selectedDate={selectedDate} />
        </View>

        {/* <TouchableOpacity
          onPress={async () => {
            await ExpoNotifications.scheduleNotificationAsync({
              content: {
                title: "Test Alarm",
                body: "Time for Paracetamol",
                data: {
                  screen: "AlarmScreen",
                  medicationName: "Paracetamol",
                  doseLogId: "123",
                  dosageValue: 200, 
                  dosageUnit: "mg",
                  streakCount: "20%",
                  scheduledTime: new Date().toISOString(),
                },
                categoryIdentifier: "DOSE_REMINDER",
              },
              // Explicitly define the trigger type for TypeScript
              trigger: {
                seconds: 5,
                type: ExpoNotifications.SchedulableTriggerInputTypes
                  .TIME_INTERVAL,
              } as ExpoNotifications.NotificationTriggerInput,
            });
            alert("Test alarm scheduled for 5 seconds!");
          }}>
          <Text className="p-4 text-blue-600">Trigger Test Alarm</Text>
        </TouchableOpacity> */}

        {/* Health tip */}
        <View className="flex-row items-start bg-splashScreen-dark mx-4 mt-4 p-5 rounded-2xl gap-4">
          <View className="bg-[#ffffff22] border border-[#ffffff33] p-2.5 rounded-xl">
            <Ionicons name="bulb" size={20} color="#FFD6C2" />
          </View>
          <View className="flex-1">
            <Text
              style={{ fontFamily: "Fraunces_700Bold" }}
              className="text-lg text-white mb-1">
              Health Tip
            </Text>
            <Text
              style={{ fontFamily: "Fraunces_700Bold" }}
              className="text-gray-400 text-sm leading-5">
              Staying hydrated is key. Drinking water with your meds helps your
              body process them better.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB overlay */}
      {showFloatingFAB && (
        <View pointerEvents="box-none">
          <FirstType
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onPanelOpenChange={setIsPanelOpen}
          />
        </View>
      )}
    </View>
  );
};

export default Page;
