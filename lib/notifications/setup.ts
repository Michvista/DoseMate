import * as Notifications from "expo-notifications";
import { notifee, NotifeeConstants } from './notifeeSafe';
const { AndroidImportance, AndroidVisibility } = NotifeeConstants;
import { Platform } from "react-native";

// ── 1. Foreground behaviour ───────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // FIX: Adding these two missing properties to satisfy the TS NotificationBehavior type
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── 2. Android notification channel ──────────────────────────────────────────
export async function setupNotificationChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("dose-alarms", {
    name: "Dose Alarms",
    description: "Medication reminders for DoseMate",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 150, 300],
    lightColor: "#9333EA",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "default",
  });
}

// ── 2.5 Notifee Channel Setup ────────────────────────────────────────────────
export async function setupNotifeeChannels() {
  if (Platform.OS !== "android") return;

  await notifee?.createChannel({
    id: "dose-alarms-v4",
    name: "Dose Alarms (Emergency)",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: "default",
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
  });
}

// ── 3. Action buttons ───────────────────────────────────────────────────────
export const DOSE_CATEGORY_ID = "DOSE_REMINDER";

export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync(DOSE_CATEGORY_ID, [
    {
      identifier: "TAKEN",
      buttonTitle: "✓  I've Taken It",
      options: { opensAppToForeground: false },
    },
    {
      identifier: "SNOOZE",
      buttonTitle: "⏰  Snooze 10 min",
      options: { opensAppToForeground: false },
    },
    {
      identifier: "SKIP",
      buttonTitle: "✕  Skip",
      options: {
        opensAppToForeground: false,
        isDestructive: true,
      },
    },
  ]);
}

// ── 4. Request permissions ────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      // FIX: 'allowAnnouncements' is removed because it's not in the standard Expo type
    },
  });

  return status === "granted";
}

export async function setupNotifications() {
  await setupNotificationChannel();
  await setupNotifeeChannels();
  await setupNotificationCategories();
  await requestNotificationPermissions();
}
