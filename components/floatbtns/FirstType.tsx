import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import CalendarStripFloat from "./calendarStripFloat";

type Props = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPanelOpenChange?: (isOpen: boolean) => void;
};

const FirstType = ({
  selectedDate,
  onDateSelect,
  onPanelOpenChange,
}: Props) => {
  const bottomValue = useSharedValue(144);
  const panelWidth = useSharedValue(60);
  const panelHeight = useSharedValue(60);
  const opacity = useSharedValue(0);
  const fabOpacity = useSharedValue(1); // FAB visible by default
  const isOpen = useSharedValue(false);

  const progress = useDerivedValue(() =>
    isOpen.value ? withTiming(1) : withTiming(0),
  );

  const open = () => {
    // Hide FAB icon first
    fabOpacity.value = withTiming(0, { duration: 150 });
    // Slide up from tab bar level
    bottomValue.value = withSpring(160, { damping: 12, stiffness: 120 });
    // Stretch width to full panel
    panelWidth.value = withDelay(
      600,
      withSpring(340, { damping: 12, stiffness: 80 }),
    );
    // Stretch height
    panelHeight.value = withDelay(
      600,
      withSpring(160, { damping: 12, stiffness: 80 }),
    );
    // Fade calendar content in
    opacity.value = withDelay(900, withTiming(1, { duration: 200 }));
    isOpen.value = true;
    onPanelOpenChange?.(true);
  };

  const close = () => {
    const config = {
      easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
      duration: 400,
    };
    // Fade content out
    opacity.value = withTiming(0, { duration: 100 });
    // Collapse width + height back to circle
    panelWidth.value = withTiming(60, { duration: 150 }, (finish) => {
      if (finish) {
        // Slide back down to FAB level
        bottomValue.value = withTiming(144, config);
        panelHeight.value = withTiming(60, { duration: 300 });
      }
    });
    // Show FAB icon again after panel is gone
    fabOpacity.value = withDelay(400, withTiming(1, { duration: 200 }));
    isOpen.value = false;
    onPanelOpenChange?.(false);
  };

  const panelStyle = useAnimatedStyle(() => ({
    bottom: bottomValue.value,
    width: panelWidth.value,
    height: panelHeight.value,
    transform: [
      {
        scale: interpolate(
          bottomValue.value,
          [144, 160],
          [0, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const contentOpacity = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const fabIconOpacity = useAnimatedStyle(() => ({
    opacity: fabOpacity.value,
    transform: [
      {
        scale: fabOpacity.value,
      },
    ],
  }));

  const plusIcon = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 45}deg` }],
  }));

  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      {/* Calendar panel — centered horizontally, sits just above tab bar */}
      <Animated.View
        style={[
          {
            position: "absolute",
            // Center horizontally: left: 50% then translateX(-50%) via alignSelf
            alignSelf: "center",
            overflow: "hidden",
            borderRadius: 20,
            backgroundColor: "#fff",
            shadowColor: "#7c3aed",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          },
          panelStyle,
        ]}>
        <Animated.View style={[{ flex: 1 }, contentOpacity]}>
          <CalendarStripFloat
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              onDateSelect(date);
              // panel stays open — user can tap chevron-down to close
            }}
          />
        </Animated.View>

        {/* Back arrow — tapping this closes the panel */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 8,
              right: 8,
            },
            contentOpacity,
          ]}>
          <Pressable
            onPress={close}
            pointerEvents="auto"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#f1f5f9",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Feather name="chevron-down" size={18} color="#64748b" />
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* FAB — entire button fades out when panel opens, back when closed */}
      <Animated.View style={fabIconOpacity}>
        <Pressable
          onPress={open}
          pointerEvents="auto"
          className="absolute bottom-36 right-2 w-12 h-12 rounded-full overflow-hidden bg-dose-upcomingText justify-center items-center">
          <View className="w-12 h-12 justify-center items-center">
            <Image
              source={require("@/assets/images/calendarFloat.svg")}
              style={{ width: 12, height: 12 }}
            />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default FirstType;
