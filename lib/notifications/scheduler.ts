// lib/notifications/scheduler.ts
// Schedule and cancel dose reminders.
// Call scheduleDoseReminder() after adding a medication or creating dose logs.
// Call cancelDoseReminder() when a dose is marked taken/skipped from the app UI.

import * as Notifications from "expo-notifications";
import { notifee, NotifeeConstants } from './notifeeSafe';
const { TriggerType, AndroidCategory, AndroidImportance, AndroidVisibility, RepeatFrequency } = NotifeeConstants;
import { Platform } from "react-native";
import { DOSE_CATEGORY_ID } from "./setup";

export interface DoseReminderPayload {
  doseLogId: string;        // _id of the APIDoseLog — used to mark it in the backend
  medicationId: string;
  medicationName: string;
  dosageValue: number;
  dosageUnit: string;
  scheduleType: string;
  scheduledTime: Date;      // exact Date object for when to fire
  streakCount?: number;     // optional — shown in the notification
}

// ── Schedule a single dose reminder ──────────────────────────────────────────
// Returns the Expo notification identifier (store it to cancel later).
export async function scheduleDoseReminder(
  payload: DoseReminderPayload
): Promise<string> {
  const {
    doseLogId,
    medicationName,
    dosageValue,
    dosageUnit,
    scheduleType,
    scheduledTime,
    streakCount = 0,
  } = payload;

  // Ensure timestamp is at least 5 seconds in the future
  const now = Date.now();
  const triggerTimestamp = Math.max(scheduledTime.getTime(), now + 5000);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTimestamp,
    alarmManager: true, 
  };

  const notificationId = doseLogId ? `dose-${doseLogId}` : `med-${payload.medicationId}-${scheduledTime.getTime()}`;

  await notifee?.createTriggerNotification(
    {
      id: notificationId,
      title: `Time for ${medicationName}`,
      body: `${dosageValue}${dosageUnit} · ${scheduleType}`,
      data: {
        doseLogId,
        medicationName,
        dosageValue,
        dosageUnit,
        scheduleType,
        scheduledTime: scheduledTime.toISOString(),
        streakCount: String(streakCount),
        screen: "Alarm",
      },
      android: {
        channelId: "dose-alarms-v4",
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        // This is the magic for "Full Screen Intent"
        fullScreenIntent: {
          id: 'default',
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        // Make it behave like a real alarm
        ongoing: true,
        autoCancel: false,
        visibility: AndroidVisibility.PUBLIC,
        actions: [
          {
            title: "I've Taken It",
            pressAction: { id: 'taken', launchActivity: 'default' },
          },
          {
            title: "Snooze",
            pressAction: { id: 'snooze' },
          },
          {
            title: "Skip",
            pressAction: { id: 'skip' },
          },
        ],
      },
    },
    trigger
  );

  return notificationId;
}

// ── Cancel a specific reminder ────────────────────────────────────────────────
export async function cancelDoseReminder(notificationId: string) {
  await notifee?.cancelNotification(notificationId);
}

// ── Cancel ALL pending dose reminders (e.g. when user deletes a medication) ───
export async function cancelAllDoseReminders() {
  await notifee?.cancelAllNotifications();
}

// ── Schedule reminders for a whole day's worth of dose logs ──────────────────
// Call this from the schedule engine after generating DoseLogs for the day.
export async function scheduleDayReminders(
  doses: DoseReminderPayload[]
): Promise<Record<string, string>> {
  // Returns { doseLogId: notificationId } so you can store and cancel individually
  const map: Record<string, string> = {};
  for (const dose of doses) {
    // Only schedule if the time is in the future
    if (new Date(dose.scheduledTime) > new Date()) {
      const notifId = await scheduleDoseReminder(dose);
      map[dose.doseLogId] = notifId;
    }
  }
  return map;
}
