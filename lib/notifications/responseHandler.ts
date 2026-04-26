// lib/notifications/responseHandler.ts
// This module handles what happens when the user taps an action button
// (Taken / Snooze / Skip) on the notification itself — even from the lock screen.
//
// Wire it up in _layout.tsx with:
//   Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { scheduleDoseReminder } from "./scheduler";

const GUEST_ID_KEY = "dosemate_guest_id";
const SNOOZE_MINUTES = 10;

export async function handleNotificationResponse(
  response: Notifications.NotificationResponse
) {
  const { actionIdentifier, notification } = response;
  const data = notification.request.content.data as {
    doseLogId: string;
    medicationName: string;
    dosageValue: number;
    dosageUnit: string;
    scheduleType: string;
    scheduledTime: string;
    streakCount: number;
  };

  const guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
  if (!guestId || !data?.doseLogId) return;

  if (
    actionIdentifier === "TAKEN" ||
    actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    // DEFAULT_ACTION_IDENTIFIER = user tapped the notification body (not a button)
    // We let the navigator handle opening AlarmScreen in this case (see _layout.tsx)
    // but also mark it if they do it from the lock screen action button
  ) {
    if (actionIdentifier === "TAKEN") {
      // Mark as taken in the backend silently
      try {
        await api.patch(`/dose-logs/${data.doseLogId}`, { status: "TAKEN" }, guestId);
      } catch (err) {
        console.warn("[notification] failed to mark dose taken:", err);
      }
    }
    // If DEFAULT — AlarmScreen will handle the API call when the user taps the button there
    return;
  }

  if (actionIdentifier === "SNOOZE") {
    // Reschedule for SNOOZE_MINUTES from now
    const snoozeTime = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
    try {
      await scheduleDoseReminder({
        doseLogId:      data.doseLogId,
        medicationId:   "", // not needed just for re-scheduling the reminder
        medicationName: data.medicationName,
        dosageValue:    data.dosageValue,
        dosageUnit:     data.dosageUnit,
        scheduleType:   data.scheduleType,
        scheduledTime:  snoozeTime,
        streakCount:    data.streakCount,
      });
    } catch (err) {
      console.warn("[notification] failed to snooze:", err);
    }
    return;
  }

  if (actionIdentifier === "SKIP") {
    try {
      await api.patch(`/dose-logs/${data.doseLogId}`, { status: "SKIPPED" }, guestId);
    } catch (err) {
      console.warn("[notification] failed to skip dose:", err);
    }
    return;
  }
}
