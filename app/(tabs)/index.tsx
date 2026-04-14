import Doses from "@/components/Doses";
import SimpleCalendarStrip from "@/components/SimpleCalendarStrip";
import FirstType from "@/components/floatbtns/FirstType";
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
} from "react-native";

const Page = () => {
  // Single source of truth — shared between strip, doses, and floating calendar
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const calendarRef = useRef(null);

  const dosesHeading = isToday(selectedDate)
    ? "Today's Doses"
    : format(selectedDate, "EEE, MMM d");

  // Show FAB if calendar is scrolled out of view OR if panel is open
  const showFloatingFAB = scrollOffset > calendarHeight + 20 || isPanelOpen;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleCalendarLayout = (event: any) => {
    setCalendarHeight(event.nativeEvent.layout.height);
  };

  return (
    <View className="flex-1 pt-[2rem] bg-white">
      {/* Header */}
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
              GOOD MORNING
            </Text>
            <Text
              className="text-black"
              style={{ fontFamily: "Fraunces_700Bold", fontSize: 16 }}>
              <Text style={{ fontFamily: "Fraunces_700Bold" }}>Maki</Text>'s
              DoseMate
            </Text>
          </View>
        </View>
        <View className="border-2 border-gray-400 rounded-full p-2">
          <Feather name="bell" size={20} />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View className="w-full items-center" onLayout={handleCalendarLayout}>
          <SimpleCalendarStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </View>

        <View className="w-full items-center">
          <View className="w-full px-6 flex-row items-center justify-between mb-1">
            <Text className="text-gray-700 text-xl " style={{ fontFamily: "Fraunces_700Bold" }}>
              {dosesHeading}
            </Text>
            <View className="flex-row items-center bg-light1 px-3 p-2 rounded-full">
              <Text style={{ fontFamily: "Fraunces_700Bold" }} className="text-splashScreen-100   text-sm">
                2 of 4 Taken
              </Text>
            </View>
          </View>
          <Doses selectedDate={selectedDate} />
        </View>

        <View className="flex-row items-start bg-splashScreen-dark mx-4 mt-4 p-5 rounded-2xl gap-4">
          <View className="bg-[#ffffff22] border border-[#ffffff33] p-2.5 rounded-xl">
            <Ionicons name="bulb" size={20} color="#FFD6C2" />
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: "Fraunces_700Bold" }} className="text-lg text-white   mb-1">
              Health Tip
            </Text>
            <Text style={{ fontFamily: "Fraunces_700Bold" }} className="text-gray-400 text-sm leading-5">
              Staying hydrated is key. Drinking water with your meds helps your
              body process them better.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB overlay — only show when calendar scrolls out of view OR panel is open */}
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
