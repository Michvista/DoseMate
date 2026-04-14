import { Text, TouchableOpacity, View } from "react-native";
// font loading moved to app/_layout.tsx so Fraunces is available app-wide
import { Image } from "expo-image";
import { useRouter } from "expo-router";

import "../../global.css";

export default function OpeningPage() {
  const router = useRouter();
  const handleStart = () => {
    // Replace the current route so the user can't navigate back to splash
    // Navigate to the tabs group root. Using `/(tabs)` matches expo-router's
    // typed href union for group routes and satisfies TypeScript.
    router.replace("/(tabs)");
  };

  //   useEffect(() => {
  //   }, []);

  // fonts are loaded in the root layout; no local blocking required here

  return (
    <View className="flex-1 bg-splashScreen-dark relative pt-20">
      <View className="flex flex-row justify-between w-full px-3 py-2">
        <View className="flex flex-row items-center gap-2">
          <Image
            source={require("@/assets/images/Background.svg")}
            style={{ width: 25, height: 25 }}
          />
          <Text
            className="capitalize text-white text-lg"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            doseMate
          </Text>
        </View>
        <Text className="text-sm text-gray-400">v1.0</Text>
      </View>
      <View className="w-full pt-6">
        <Image
          source={require("@/assets/images/splashScreenImg.png")}
          style={{ width: "100%", height: 400, resizeMode: "contain" }}
        />
        <View className="flex -translate-y-8 items-center justify-center px-2 gap-6">
          <Text
            className="text-5xl text-white text-center capitalize w-[80%]"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            Your Health,
            <Text
              className="text-splashScreen-100"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              {"\n"}Simplified.
            </Text>
          </Text>

          <Text
            className="text-center text-gray-700 w-[80%]"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            The trusted medication companion for patients across Nigeria. Never
            miss a dose again.
          </Text>
        </View>
      </View>

      <View className="w-full btns flex items-center ">
        <TouchableOpacity
          onPress={handleStart}
          className="bg-splashScreen-100 flex flex-row items-center justify-center p-4  rounded-xl w-[90%]">
          <Image
            source={require("@/assets/images/google.svg")}
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          <Text
            className="text-white  text-base"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
