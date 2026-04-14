import { Text, View } from "react-native";

type Props = {
  percentage: number;
  daysCount: number;
  goalMet: boolean;
};

const AdherenceCard = ({ percentage, daysCount, goalMet }: Props) => {
  return (
    <View className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text
            className="text-base font-bold text-dark mb-1"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            Weekly Adherence
          </Text>
          <Text
            className="text-sm text-gray-500 leading-5"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            You've reached {percentage}% adherence{"\n"}for {daysCount} days this week!
          </Text>
        </View>
        <Text
          className="text-4xl  text-tabs-100"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          {percentage}%
        </Text>
      </View>

      {goalMet && (
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-light1">
          <View className="w-2 h-2 rounded-full bg-tabs-100" />
          <Text
            className="text-[11px] text-tabs-100 tracking-widest"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            WEEKLY GOAL MET
          </Text>
        </View>
      )}
    </View>
  );
};

export default AdherenceCard;
