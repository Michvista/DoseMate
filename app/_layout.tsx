import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  useFonts,
} from "@expo-google-fonts/fraunces";
import { Slot } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [defaultSet, setDefaultSet] = useState(false);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
  });

  if (fontsLoaded && !defaultSet) {
    const textAny = Text as any;
    const defaultTextProps: any = textAny.defaultProps || {};
    defaultTextProps.style = [
      defaultTextProps.style || {},
      { fontFamily: "Fraunces_400Regular" },
    ];
    textAny.defaultProps = defaultTextProps;
    setDefaultSet(true);
  }

  if (!fontsLoaded) return null;

  return (
    // Render a Slot at the root so the router's navigators are mounted
    // immediately. This ensures route-level redirects (like the one in
    // `app/index.tsx`) can call navigation methods without the "navigate
    // before mounting" error.
    <Slot />
  );
}
