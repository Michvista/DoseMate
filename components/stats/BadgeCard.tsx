import { FontAwesome6 } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  title: string;
  description: string;
  daysLeft?: number;
};

const BadgeCard = ({ title, description }: Props) => {
  return (
    <View className="mx-4 mb-4 rounded-3xl bg-white p-5 flex-row items-center gap-4 shadow-sm">
      <View className="w-14 h-14 rounded-2xl bg-light1 items-center justify-center">
        <FontAwesome6 name="award" size={28} color="#9333EA" />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-bold text-dark mb-1"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          {title}
        </Text>
        <Text
          className="text-sm text-gray-500"
          style={{ fontFamily: "Fraunces_400Regular" }}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default BadgeCard;
