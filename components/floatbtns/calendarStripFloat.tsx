import { addDays, format, isSameDay } from "date-fns";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
};

const CalendarStripFloat = ({ selectedDate, onDateSelect }: Props) => {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i - 2));

  return (
    <View style={{ flex: 1, padding: 16, paddingRight: 48 }}>
      {/* Month header */}
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          fontFamily: "Fraunces_700Bold",
          color: "#94a3b8",
          letterSpacing: 1.5,
          marginBottom: 12,
        }}>
        {format(selectedDate, "MMMM yyyy").toUpperCase()}
      </Text>

      {/* Day pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {days.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const dayName = format(date, "EEE").toUpperCase();
            const dayNumber = format(date, "d");

            return (
              <Pressable
                key={index}
                onPress={() => onDateSelect(date)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 72,
                  borderRadius: 999,
                  backgroundColor: isSelected ? "#B19CD9" : "#f8fafc",
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#7c3aed",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.2 : 0,
                  shadowRadius: 8,
                  elevation: isSelected ? 4 : 0,
                }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    fontFamily: "Fraunces_700Bold",
                    letterSpacing: 1,
                    marginBottom: 4,
                    color: isSelected ? "#fff" : "#94a3b8",
                  }}>
                  {dayName}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    fontFamily: "Fraunces_700Bold",
                    color: isSelected ? "#fff" : "#0f172a",
                  }}>
                  {dayNumber}
                </Text>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginTop: 4,
                    backgroundColor: isSelected
                      ? "#fff"
                      : isToday
                        ? "#B19CD9"
                        : "transparent",
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarStripFloat;
