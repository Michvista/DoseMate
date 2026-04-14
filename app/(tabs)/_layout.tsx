import { TabBar } from "@/components/TabBar";
import { Tabs } from "expo-router";
import { useState } from "react";


import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  useFonts,
} from "@expo-google-fonts/fraunces";

const TabLayout = () => {
    const [fontsLoaded] = useFonts({
      Fraunces_400Regular,
      Fraunces_700Bold,
    });

      const [defaultSet, setDefaultSet] = useState(false);
      if (fontsLoaded && !defaultSet) {
        const textAny = Text as any;
        const defaultTextProps: any = textAny.defaultProps || {};
        // when using expo-google-fonts, the loaded font family names are the keys
        // we registered above (e.g. Fraunces_400Regular, Fraunces_700Bold)
        defaultTextProps.style = [
          defaultTextProps.style || {},
          { fontFamily: "Fraunces_400Regular" },
        ];
        textAny.defaultProps = defaultTextProps;
        setDefaultSet(true);
      }
    
      if (!fontsLoaded) return null;

  return (
    <Tabs
    screenOptions={{
            headerShown: false,
          }}
    tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
      <Tabs.Screen name="add" options={{ title: "Plus" }} />
      <Tabs.Screen name="meds" options={{ title: "Meds" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default TabLayout;
