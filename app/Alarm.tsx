import { api } from "@/lib/api/client";
import { useGuest } from "@/lib/context/GuestContext";
import { MedicationIcons } from "@/lib/MedicationIcons";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Notifications from "expo-notifications";
import { notifee, NotifeeConstants } from '@/lib/notifications/notifeeSafe';
const { TriggerType, AndroidCategory, AndroidImportance } = NotifeeConstants;
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AlarmScreen() {
  const { guestId } = useGuest();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<"taken" | "skipped" | "snoozed" | null>(
    null,
  );

  // Destructure params safely
  const medName = params.medicationName || "Medication";
  const dosage = params.dosageValue || "";
  const unit = params.dosageUnit || "";
  const streak = params.streakCount || "0";
  const logId = params.doseLogId; // This needs to be passed in the notification data

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // --- ACTIONS ---

  const handleTaken = async () => {
    let activeLogId = logId;

    // If no logId was passed (common for recurring notifications), try to find today's log
    if (!activeLogId && params.medicationId && guestId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const logs = await api.get<any[]>(`/dose-logs?date=${today}&medicationId=${params.medicationId}`, guestId);
        if (logs.length > 0) {
          activeLogId = logs[0]._id;
        }
      } catch (e) {
        console.error("Failed to find log for medication:", e);
      }
    }

    if (!activeLogId) return Alert.alert("Error", "Could not find a dose record to update. Please mark it manually in the app.");
    if (!guestId) return Alert.alert("Error", "User session not found.");
    if (!guestId) return Alert.alert("Error", "User session not found."); // Ensure guestId exists

    setLoading(true);
    try {
      // TypeScript fix: explicitly check guestId is not null
      if (guestId && activeLogId) {
        await api.patch(`/dose-logs/${activeLogId}`, { status: "TAKEN" }, guestId);
        await notifee?.cancelNotification(`dose-${activeLogId}`);
        setDone("taken");
        setTimeout(() => router.dismiss(), 1500);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to mark as taken");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert("Skip Dose?", "Are you sure you want to skip this dose?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        onPress: async () => {
          let activeLogId = logId;
          if (!activeLogId && params.medicationId && guestId) {
            try {
              const today = new Date().toISOString().split('T')[0];
              const logs = await api.get<any[]>(`/dose-logs?date=${today}&medicationId=${params.medicationId}`, guestId);
              if (logs.length > 0) activeLogId = logs[0]._id;
            } catch (e) {
              console.error("Failed to find log for medication:", e);
            }
          }

          if (!activeLogId) {
            Alert.alert("Notice", "Record not found, but we'll dismiss the alarm.");
            router.dismiss();
            return;
          }

          setLoading(true);
          try {
            if (guestId && activeLogId) {
              await api.patch(
                `/dose-logs/${activeLogId}`,
                { status: "SKIPPED" },
                guestId,
              );
              await notifee?.cancelNotification(`dose-${activeLogId}`);
              setDone("skipped");
              setTimeout(() => router.dismiss(), 1500);
            }
          } catch (err) {
            Alert.alert("Error", "Failed to skip dose.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

 const handleSnooze = async () => {
   setLoading(true);
   try {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 10);
      await notifee.createTriggerNotification(
        {
          title: `Snooze: ${medName}`,
          body: `Reminder to take your ${dosage}${unit}`,
          data: params as any,
          android: {
            channelId: "dose-alarms-v4",
            category: AndroidCategory.ALARM,
            importance: AndroidImportance.HIGH,
            fullScreenIntent: { id: 'default' },
            pressAction: { id: 'default', launchActivity: 'default' },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: date.getTime(),
          alarmManager: true,
        }
      );
     setDone("snoozed");
     setTimeout(() => router.dismiss(), 1500);
   } catch (err) {
     Alert.alert("Error", "Failed to snooze");
   } finally {
     setLoading(false);
   }
 };

  return (
    <View className="flex-1 bg-[#0D0218]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-14">
        <View className="flex-row items-center">
          <View className="bg-[#2D1657] p-2 rounded-xl mr-3">
            <Ionicons name="medical" size={20} color="#A78BFA" />
          </View>
          <View>
            <Text
              className="text-[#A78BFA] text-[10px] tracking-[1.5px]"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              NOTIFICATION
            </Text>
            <Text
              className="text-white text-lg"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              DoseMate
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#1E1432] p-[10px] rounded-full">
          <Feather name="x" size={20} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      {/* Center Image */}
      <View className="flex-1 items-center justify-center">
        <View className="w-[220px] h-[220px] rounded-full bg-[#4C1D95] justify-center items-center relative">
          <View className="absolute bottom-2 right-2 bg-[#9333EA] p-3 rounded-full border-4 border-[#0D0218] z-10">
            <Feather name="bell" size={24} color="white" />
          </View>
          <View className="w-[200px] h-[200px] rounded-full overflow-hidden bg-[#5B21B6] justify-center items-center">
            <MedicationIcons.pill size={120} color="#E9D5FF" />
          </View>
        </View>

        <Animated.View
          style={{ opacity: fadeAnim }}
          className="mt-10 items-center">
          <Text
            className="text-white text-4xl text-center px-4"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            {medName}
          </Text>
          <View className="bg-[#1E1432] px-5 py-2 rounded-full mt-3">
            <Text className="text-[#A78BFA] text-base">
              {dosage} {unit}
            </Text>
          </View>

          {done ? (
            <Text
              className="text-white text-lg mt-8"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              {done === "taken"
                ? "✓ Marked as Taken"
                : done === "snoozed"
                  ? "⏰ Snoozed for 10m"
                  : "✕ Dose Skipped"}
            </Text>
          ) : (
            <Text
              className="text-slate-200 text-lg mt-8 opacity-80"
              style={{ fontFamily: "Fraunces_400Regular" }}>
              Time for your scheduled dose
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Buttons */}
      {!done && (
        <View className="px-6 pb-12">
          <TouchableOpacity
            onPress={handleTaken}
            disabled={loading}
            className="bg-[#9333EA] h-[65px] rounded-2xl flex-row justify-center items-center shadow-lg shadow-purple-500/50">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="white"
                  className="mr-2"
                />
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  I've Taken It
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row mt-4 gap-4">
            <TouchableOpacity
              onPress={handleSnooze}
              disabled={loading}
              className="flex-1 bg-[#1E1432] h-[60px] rounded-2xl flex-row justify-center items-center border border-[#2D1657]">
              <Ionicons name="alarm" size={20} color="#A78BFA" />
              <Text
                className="text-[#A78BFA] text-base ml-2"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                Snooze
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              disabled={loading}
              className="flex-1 bg-[#1E1432] h-[60px] rounded-2xl flex-row justify-center items-center border border-[#2D1657]">
              <Ionicons name="close" size={20} color="#64748B" />
              <Text
                className="text-slate-500 text-base ml-2"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
