import { Platform } from 'react-native';

// Safely require Notifee only on Android and when available
// This prevents the "Module Not Found" crash in Expo Go or before rebuilding
const getNotifee = () => {
  if (Platform.OS === 'web') return null;
  try {
    return require('@notifee/react-native').default;
  } catch (e) {
    console.warn('Notifee native module not found. Rebuild your app with npx expo run:android');
    return null;
  }
};

const getNotifeeConstants = () => {
  if (Platform.OS === 'web') return {};
  try {
    return require('@notifee/react-native');
  } catch (e) {
    return {};
  }
};

export const notifee = getNotifee();
export const NotifeeConstants = getNotifeeConstants();
