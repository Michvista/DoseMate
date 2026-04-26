// lib/context/GuestContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE_URL } from "../api/config";

const GUEST_ID_KEY = "dosemate_guest_id";

interface GuestContextValue {
  guestId: string | null;
  isReady: boolean; // false until we've checked AsyncStorage
}

const GuestContext = createContext<GuestContextValue>({
  guestId: null,
  isReady: false,
});

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const init = useCallback(async () => {
    try {
      // For development/seed purposes, hardcode the seed guest ID
      const SEED_GUEST_ID = "000000000000000000000001";
      setGuestId(SEED_GUEST_ID);
    } catch (err) {
      console.error("[GuestContext] init failed:", err);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <GuestContext.Provider value={{ guestId, isReady }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
