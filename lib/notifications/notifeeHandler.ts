import { notifee, NotifeeConstants } from './notifeeSafe';
const { EventType, TriggerType, AndroidCategory, AndroidImportance } = NotifeeConstants;
import { router } from 'expo-router';
import { api } from '@/lib/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

// This handler runs even when the app is closed/killed
export async function registerNotifeeBackgroundHandler() {
  notifee?.onBackgroundEvent(async ({ type, detail }: any) => {
    const { notification, pressAction } = detail;

    console.log('Notifee Background Event:', type, notification?.id);

    // If the notification is delivered, try to force-open the app
    if (type === EventType.DELIVERED && notification?.data?.screen === 'Alarm') {
      const data = notification.data;
      const queryString = Object.keys(data)
        .map(key => `${key}=${encodeURIComponent(String(data[key]))}`)
        .join('&');
      
      // Attempt to deep link into the app to bring it to the foreground
      // This works best if "Display over other apps" is enabled
      Linking.openURL(`dosemate://Alarm?${queryString}`).catch(err => {
        console.error('Failed to force-open app from background:', err);
      });
    }

    // If the user pressed an action button
    if (type === EventType.ACTION_PRESS) {
      const { id } = pressAction;
      const { doseLogId, medicationName, dosageValue, dosageUnit } = notification?.data || {};

      const guestId = await AsyncStorage.getItem('guestId');

      if (id === 'taken' || id === 'skip') {
        if (doseLogId && guestId) {
          try {
            await api.patch(`/dose-logs/${doseLogId}`, { status: id === 'taken' ? 'TAKEN' : 'SKIPPED' }, guestId as string);
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
