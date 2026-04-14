import { icon } from "@/constants/icon";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect } from "react";
import { View } from "react-native";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Animated from "react-native-reanimated";

type TabBarButtonProps = {
  onPress?: () => void;
  onLongPress?: () => void;
  isFocused?: boolean;
  routeName: string;
  color?: string;
  label?: React.ReactNode;
};

const TabBarButton: React.FC<TabBarButtonProps> = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}) => {
  const tint = isFocused ? (color ?? "#9333EA") : "#222";
  const scale = useSharedValue(0);

  useEffect(() => {
    // animate to 1 when focused, 0 when not. useTiming so we can pass duration.
    scale.value = withTiming(
      typeof isFocused === "boolean"
        ? isFocused
          ? 1
          : 0
        : ((isFocused as any) ?? 0),
      { duration: 250 },
    );
  }, [isFocused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 9]);

    return {
      transform: [{ scale: scaleValue }],
      top: top
    };
  })

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  return (
    <PlatformPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: 1 }}
      className="flex-1 justify-center items-center gap-5">
      <Animated.View style={animatedIconStyle}>
        {icon[routeName as keyof typeof icon]?.({
          color: tint,
        })}
      </Animated.View>
      <Animated.Text
        
        style={[
          { color: tint, fontSize: 12, fontFamily: "Fraunces_400Regular" },
          animatedTextStyle,
        ]}>
        {label}
      </Animated.Text>
    </PlatformPressable>
  );
};

export default TabBarButton;
