import { FontAwesome6 } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  streak: number;
  percentChange: number;
  message: string;
};

const StreakCard = ({ streak, percentChange, message }: Props) => {
  return (
    <View className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text
            className="text-splashScreen-100 text-[11px] tracking-widest mb-1"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            CURRENT STREAK
          </Text>
          <Text
            className="text-black text-[52px] leading-[58px]"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            {streak} Days
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-row items-center gap-1 bg-light1 px-3 py-1 rounded-full">
              <FontAwesome6 name="arrow-trend-up" size={12} color="#9333EA" />
              <Text
                className="text-[11px] text-splashScreen-100 font-bold"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                +{percentChange}%
              </Text>
            </View>
            <Text
              className="text-xs text-gray-500 flex-1"
              style={{ fontFamily: "Fraunces_400Regular" }}>
              {message}
            </Text>
          </View>
        </View>
        <View className="bg-light1 rounded-2xl p-3 items-center justify-center">
          <FontAwesome6 name="fire" size={32} color="#9333EA" />
        </View>
      </View>
    </View>
  );
};

export default StreakCard;
