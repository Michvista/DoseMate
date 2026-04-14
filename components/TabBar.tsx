import { icon } from "@/constants/icon";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import TabBarButton from "./TabBarButton";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="flex flex-row justify-between absolute bottom-2 items-center p-4 bg-white">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any, route.params as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const labelContent =
          typeof label === "function"
            ? label({
                focused: isFocused,
                color: isFocused ? "#9333EA" : "#222",
                position: "below-icon" as any,
                children:
                  typeof options.title === "string"
                    ? options.title
                    : route.name,
              })
            : label;

        // Special centered raised button for the `add` route
        if (route.name === "add") {
          return (
            <PlatformPressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              style={styles.centerContainer}>
              <View style={styles.fab} className="items-center justify-center">
                {/** white icon on purple background */}
                {/** route.name exists in icon map */}
                {/** color forced to white */}
                {/** use icon renderer */}
                {icon[route.name as keyof typeof icon]?.({
                  color: "#fff",
                  size: 32,
                })}
              </View>
            </PlatformPressable>
          );
        }

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? "#9333EA" : "#222"}
            label={labelContent as any}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#9333EA",
    marginBottom: 16,
    elevation: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    transform: [{ translateY: -12 }],
  },
});
