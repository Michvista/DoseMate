import { useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Text, TouchableOpacity, View } from "react-native";

interface MedsTabBarProps {
  tabs: string[];
  activeIndex: number;
  onPress: (i: number) => void;
}

export const MedsTabBar = ({ tabs, activeIndex, onPress }: MedsTabBarProps) => {
  const [layouts, setLayouts] = useState<{ x: number; width: number }[]>(
    tabs.map(() => ({ x: 0, width: 0 })),
  );
  const [measured, setMeasured] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const runAnim = (index: number, currentLayouts: { x: number; width: number }[]) => {
    if (!currentLayouts.every((l) => l.width > 0)) return;
    Animated.spring(anim, {
      toValue: currentLayouts[index].x,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const onLayout = (e: LayoutChangeEvent, i: number) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[i] = { x, width };
      if (next.every((l) => l.width > 0) && !measured) {
        setMeasured(true);
        runAnim(activeIndex, next);
      }
      return next;
    });
  };

  const handlePress = (i: number) => {
    onPress(i);
    runAnim(i, layouts);
  };

  const underlineWidth = layouts[activeIndex]?.width ?? 0;

  return (
    <View className="border-b border-gray-100 w-full">
      <View className="flex-row px-3">
        {tabs.map((label, i) => (
          <TouchableOpacity
            key={i}
            onLayout={(e) => onLayout(e, i)}
            onPress={() => handlePress(i)}
            className="flex-1 items-center pb-3 pt-1">
            <Text
              className={`text-sm font-bold ${activeIndex === i ? "text-dark" : "text-gray-400"}`}
              style={{ fontFamily: "Fraunces_700Bold" }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View
        className="absolute bottom-0 h-[3px] rounded-full bg-tabs-100"
        style={{ width: underlineWidth, transform: [{ translateX: anim }] }}
      />
    </View>
  );
};
