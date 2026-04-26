import { notifee, NotifeeConstants } from './notifeeSafe';
const { EventType, TriggerType, AndroidCategory, AndroidImportance } = NotifeeConstants;
import { router } from 'expo-router';
import { api } from '@/lib/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This handler runs even when the app is closed/killed
export async function registerNotifeeBackgroundHandler() {
  notifee?.onBackgroundEvent(async ({ type, detail }: any) => {
    const { notification, pressAction } = detail;

    console.log('Notifee Background Event:', type, notification?.id);

    // If the user pressed an action button
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
            console.error('Failed to update dose status in background:', e);
          }
        }
      } else if (id === 'snooze') {
        // Reschedule for 10 minutes later
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
          {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
            alarmManager: true,
          }
        );
        await notifee?.cancelNotification(notification.id!);
      }
    }
  });
}
