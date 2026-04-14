import { addDays, format, isSameDay } from "date-fns";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
};

const SimpleCalendarStrip = ({ selectedDate, onDateSelect }: Props) => {
  const today = new Date();
  const days = Array.from({ length: 5 }).map((_, i) => addDays(today, i - 1));

  return (
    <View style={styles.container}>
      {days.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        const dayName = format(date, "EEE").toUpperCase();
        const dayNumber = format(date, "d");

        return (
          <Pressable
            key={index}
            onPress={() => onDateSelect(date)}
            style={[
              styles.card,
              isSelected ? styles.selectedCard : styles.idleCard,
              isSelected ? { backgroundColor: "#B19CD9" } : undefined,
            ]}>
            <Text
              style={[isSelected ? styles.selectedDayText : styles.idleDayText, { fontFamily: "Fraunces_400Regular" }]}>
              {dayName}
            </Text>
  
            <Text
              style={[isSelected ? styles.selectedNumText : styles.idleNumText, { fontFamily: "Fraunces_400Regular" }]}>
              {dayNumber}
            </Text>
  
            {isSelected && <View style={styles.selectedDot} />}
  
            {isToday && !isSelected && <View style={styles.todayDot} />}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#fff",
    width: "100%",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    width: 65,
    height: 100,
    borderRadius: 26,
  },
  selectedCard: {
    // subtle shadow for selected
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  idleCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  selectedDayText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Fraunces_700Bold",
    marginBottom: 6,
    color: "#fff",
    letterSpacing: 1,
  },
  idleDayText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Fraunces_700Bold",
    marginBottom: 6,
    color: "#94a3b8",
    letterSpacing: 1,
  },
  selectedNumText: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Fraunces_700Bold",
    color: "#fff",
  },
  idleNumText: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Fraunces_700Bold",
    color: "#0f172a",
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7c3aed",
    marginTop: 8,
  },
});

export default SimpleCalendarStrip;
