import {
  Fraunces_400Regular,
  Fraunces_700Bold,
  useFonts,
} from "@expo-google-fonts/fraunces";
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api/client";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { GuestProvider } from "@/lib/context/GuestContext";
import { setupNotifications } from "@/lib/notifications/setup";
import { notifee, NotifeeConstants } from '@/lib/notifications/notifeeSafe';
const { EventType, TriggerType, AndroidCategory, AndroidImportance } = NotifeeConstants;
import { registerNotifeeBackgroundHandler } from "@/lib/notifications/notifeeHandler";

SplashScreen.preventAutoHideAsync();

// Register the background handler as early as possible on Android
if (Platform.OS === 'android') {
  registerNotifeeBackgroundHandler();
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
  });
  const [defaultSet, setDefaultSet] = useState(false);

  useEffect(() => {
    // ── 1. Expo Notifications (Still used for some logic or legacy) ─────────────
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        if (data?.screen === "Alarm") {
          router.push({ pathname: "/Alarm", params: data as any });
        }
      },
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.screen === "Alarm") {
          router.push({ pathname: "/Alarm", params: data as any });
        }
      }
    );

    // ── 2. Notifee Foreground Events ──────────────────────────────────────────
    const unsubscribeNotifee = notifee?.onForegroundEvent(async ({ type, detail }: any) => {
      const { notification, pressAction } = detail;
      
      if (type === EventType.ACTION_PRESS) {
        const { id } = pressAction;
        const { doseLogId, medicationName, dosageValue, dosageUnit } = notification?.data || {};
        const guestId = await AsyncStorage.getItem('guestId');

        if (id === 'taken' || id === 'skip') {
          if (doseLogId && guestId) {
            try {
              await api.patch(`/dose-logs/${doseLogId}`, { status: id === 'taken' ? 'TAKEN' : 'SKIPPED' }, guestId);
              await notifee?.cancelNotification(notification.id!);
            } catch (e) {
              console.error('Foreground action failed:', e);
            }
          }
        } else if (id === 'snooze') {
          const date = new Date();
          date.setMinutes(date.getMinutes() + 10);
          await notifee?.createTriggerNotification(
            {
              title: `Snooze: ${medicationName}`,
              body: `Reminder to take your ${dosageValue}${dosageUnit}`,
              data: notification?.data,
              android: {
                channelId: "dose-alarms-v4",
                category: AndroidCategory.ALARM,
                importance: AndroidImportance.HIGH,
                fullScreenIntent: { id: 'default' },
                pressAction: { id: 'default', launchActivity: 'default' },
              },
            },
            { type: TriggerType.TIMESTAMP, timestamp: date.getTime(), alarmManager: true }
          );
          await notifee?.cancelNotification(notification.id!);
        }
      }

      // If the app is opened via a notification or a full-screen intent
      if (type === EventType.PRESS || (type === EventType.DELIVERED && notification?.data?.screen === 'Alarm')) {
        if (notification?.data?.screen === "Alarm") {
           // Small delay to ensure navigation is ready
           setTimeout(() => {
             router.push({
               pathname: "/Alarm",
               params: notification.data as any,
             });
           }, 100);
        }
      }
    });

    // ── 3. Handle Initial Notification (if app was killed) ───────────────────
    notifee?.getInitialNotification().then((initial: any) => {
      if (initial?.notification?.data?.screen === "Alarm") {
        setTimeout(() => {
          router.push({
            pathname: "/Alarm",
            params: initial.notification.data as any,
          });
        }, 500);
      }
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
      unsubscribeNotifee?.();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GuestProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="Alarm"
          options={{
            presentation: "fullScreenModal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </GuestProvider>
  );
}
