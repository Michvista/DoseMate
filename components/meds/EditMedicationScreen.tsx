import { MedicationIcons } from "@/lib/MedicationIcons";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { fmt, fmtDate, makeTime, SCHEDULE_PRESETS } from "../../lib/data";
import { DoseTime, Medication } from "../../lib/types";

interface EditMedicationScreenProps {
  med: Medication;
  onBack: () => void;
  onSave?: (updated: Medication) => void;
}

export const EditMedicationScreen = ({
  med,
  onBack,
  onSave,
}: EditMedicationScreenProps) => {
  const [medName, setMedName] = useState(med.name);
  const [dosage, setDosage] = useState(med.dosage);
  const [notes, setNotes] = useState(med.notes ?? "");
  const [activePreset, setActivePreset] = useState(1);
  const [doses, setDoses] = useState<DoseTime[]>(
    SCHEDULE_PRESETS[1].times.map((t, i) => ({ ...t, id: String(i) })),
  );

  const [startDate, setStartDate] = useState<Date>(new Date("2023-10-01"));
  const [endDate, setEndDate] = useState<Date>(new Date("2023-12-31"));

  // Temp values for pickers — committed on "Done"
  const [tempStartDate, setTempStartDate] = useState<Date>(
    new Date("2023-10-01"),
  );
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date("2023-12-31"));

  const [editingDose, setEditingDose] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handlePreset = (i: number) => {
    setActivePreset(i);
    setDoses(
      SCHEDULE_PRESETS[i].times.map((t, idx) => ({
        ...t,
        id: String(Date.now() + idx),
      })),
    );
  };

  const addDose = () =>
    setDoses((prev) => [
      ...prev,
      { id: String(Date.now()), time: makeTime(12), label: "CUSTOM" },
    ]);

  const removeDose = (id: string) =>
    setDoses((prev) => prev.filter((d) => d.id !== id));

  const openTimePicker = (dose: DoseTime) => {
    setTempTime(dose.time);
    setEditingDose(dose.id);
  };

  const confirmTime = () => {
    if (!editingDose) return;
    setDoses((prev) =>
      prev.map((d) => (d.id === editingDose ? { ...d, time: tempTime } : d)),
    );
    setEditingDose(null);
  };

  return (
    <View className="flex-1 bg-[#F8F6FF]" style={{ paddingTop: 56 }}>
      {/* ── Header ── */}
      <View className="flex-row items-center px-4 pb-4 gap-3">
        <TouchableOpacity
          onPress={onBack}
          className="w-9 h-9 rounded-full items-center justify-center bg-[#EDE9FE]">
          <Feather name="arrow-left" size={18} color="#9333EA" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#9333EA",
              fontFamily: "Fraunces_700Bold",
            }}>
            EDITING MEDICATION
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: "#1A0A2E",
              fontFamily: "Fraunces_700Bold",
            }}>
            {med.name}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            fontFamily: "Fraunces_400Regular",
          }}>
          Last updated: 2 days ago
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 140,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Icon preview */}
          <View
            style={{
              backgroundColor: med.color + "20",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 24,
              marginTop: 4,
            }}>
            {(() => {
              const Icon =
                (MedicationIcons as any)[med.icon || "pill"] ??
                (MedicationIcons as any).pill;
              return <Icon size={48} color={med.color} />;
            })()}
            <Text
              style={{
                fontSize: 10,
                color: med.color,
                fontFamily: "Fraunces_700Bold",
                marginTop: 8,
                letterSpacing: 2,
              }}>
              {(med.icon || "PILL").toUpperCase()}
            </Text>
          </View>

          {/* Dashed separator */}
          <View
            style={{
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#C4B5FD",
              borderRadius: 8,
              marginVertical: 2,
            }}
          />

          {/* Medication name */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#9333EA",
                fontFamily: "Fraunces_700Bold",
                marginBottom: 4,
              }}>
              MEDICATION NAME
            </Text>
            <TextInput
              value={medName}
              onChangeText={setMedName}
              returnKeyType="next"
              style={{
                fontSize: 16,
                color: "#1A0A2E",
                fontFamily: "Fraunces_400Regular",
              }}
            />
          </View>

          {/* Dosage */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#9333EA",
                fontFamily: "Fraunces_700Bold",
                marginBottom: 4,
              }}>
              DOSAGE (MG)
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                keyboardType="numeric"
                returnKeyType="done"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#1A0A2E",
                  fontFamily: "Fraunces_400Regular",
                }}
              />
              <View
                style={{
                  backgroundColor: "#EDE9FE",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9333EA",
                    fontFamily: "Fraunces_700Bold",
                  }}>
                  mg
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Schedule */}
          <View
            style={{
              backgroundColor: "#EDE9FE",
              borderRadius: 16,
              padding: 16,
            }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Fraunces_700Bold",
                  color: "#1A0A2E",
                }} className="mr-3">
                Daily Schedule
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {SCHEDULE_PRESETS.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handlePreset(i)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor:
                          activePreset === i ? "#9333EA" : "#fff",
                        borderWidth: activePreset !== i ? 1 : 0,
                        borderColor: "#E2D9F3",
                      }}>
                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: "Fraunces_700Bold",
                          color: activePreset === i ? "#fff" : "#9CA3AF",
                          letterSpacing: 0.5,
                        }}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ gap: 8 }}>
              {doses.map((dose) => (
                <TouchableOpacity
                  key={dose.id}
                  onPress={() => openTimePicker(dose)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#EDE9FE",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      {dose.label === "MORNING" ? (
                        <Feather name="sun" size={14} color="#9333EA" />
                      ) : dose.label === "EVENING" ? (
                        <Feather name="moon" size={14} color="#9333EA" />
                      ) : (
                        <Feather name="clock" size={14} color="#9333EA" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Fraunces_700Bold",
                        color: "#1A0A2E",
                      }}>
                      {fmt(dose.time)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{
                        fontSize: 9,
                        fontFamily: "Fraunces_700Bold",
                        color: "#9CA3AF",
                        letterSpacing: 1,
                      }}>
                      {dose.label}
                    </Text>
                    <Feather name="edit-2" size={11} color="#CBD5E1" />
                    {doses.length > 1 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeDose(dose.id);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Feather name="x" size={13} color="#CBD5E1" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={addDose}
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: "#957DC2",
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}>
              <Feather name="plus" size={13} color="#957DC2" />
              <Text
                style={{
                  fontSize: 13,
                  color: "#957DC2",
                  fontFamily: "Fraunces_700Bold",
                }}>
                Add Another Dose
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date range */}
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={() => {
                setTempStartDate(startDate);
                setShowStartPicker(true);
              }}
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#9333EA",
                  fontFamily: "Fraunces_700Bold",
                  marginBottom: 4,
                }}>
                START DATE
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontSize: 15,
                    color: "#1A0A2E",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  {fmtDate(startDate)}
                </Text>
                <Feather name="calendar" size={14} color="#957DC2" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setTempEndDate(endDate);
                setShowEndPicker(true);
              }}
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}>
              <Text
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#9333EA",
                  fontFamily: "Fraunces_700Bold",
                  marginBottom: 4,
                }}>
                END DATE
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontSize: 15,
                    color: "#1A0A2E",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  {fmtDate(endDate)}
                </Text>
                <Feather name="calendar" size={14} color="#957DC2" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 12,
            }}>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#9333EA",
                fontFamily: "Fraunces_700Bold",
                marginBottom: 4,
              }}>
              ADDITIONAL NOTES
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Take after breakfast with a full glass of water..."
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={3}
              style={{
                fontSize: 13,
                color: "#1A0A2E",
                fontFamily: "Fraunces_400Regular",
                textAlignVertical: "top",
                minHeight: 72,
                lineHeight: 20,
              }}
            />
          </View>

          {/* Footer */}
          <View style={{ paddingTop: 8, paddingBottom: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={() => onSave?.({ ...med, name: medName, dosage, notes })}
              style={{
                backgroundColor: "#9333EA",
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: "center",
              }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "Fraunces_700Bold",
                  letterSpacing: 0.5,
                }}>
                Save Changes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBack} style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  fontFamily: "Fraunces_400Regular",
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Time picker ── */}
      <Modal
        visible={editingDose !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingDose(null)}>
        <TouchableWithoutFeedback onPress={() => setEditingDose(null)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  paddingBottom: Platform.OS === "ios" ? 48 : 20,
                }}>
                <View className="flex-row justify-between items-center mb-2">
                  <TouchableOpacity onPress={() => setEditingDose(null)}>
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 15,
                        fontFamily: "Fraunces_400Regular",
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                    }}>
                    Set Time
                  </Text>
                  <TouchableOpacity onPress={confirmTime}>
                    <Text
                      style={{
                        color: "#9333EA",
                        fontSize: 15,
                        fontFamily: "Fraunces_700Bold",
                      }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, date) => {
                    if (date) setTempTime(date);
                    if (Platform.OS === "android") confirmTime();
                  }}
                  style={{ width: "100%" }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Start date picker ── */}
      <Modal
        visible={showStartPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStartPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowStartPicker(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  paddingBottom: Platform.OS === "ios" ? 48 : 20,
                }}>
                <View className="flex-row justify-between items-center mb-2">
                  <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontFamily: "Fraunces_400Regular",
                        fontSize: 15,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                      fontSize: 15,
                    }}>
                    Start Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setStartDate(tempStartDate);
                      setShowStartPicker(false);
                    }}>
                    <Text
                      style={{
                        color: "#9333EA",
                        fontFamily: "Fraunces_700Bold",
                        fontSize: 15,
                      }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempStartDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, date) => {
                    if (date) {
                      setTempStartDate(date);
                      if (Platform.OS === "android") {
                        setStartDate(date);
                        setShowStartPicker(false);
                      }
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── End date picker ── */}
      <Modal
        visible={showEndPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowEndPicker(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  paddingBottom: Platform.OS === "ios" ? 48 : 20,
                }}>
                <View className="flex-row justify-between items-center mb-2">
                  <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontFamily: "Fraunces_400Regular",
                        fontSize: 15,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                      fontSize: 15,
                    }}>
                    End Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEndDate(tempEndDate);
                      setShowEndPicker(false);
                    }}>
                    <Text
                      style={{
                        color: "#9333EA",
                        fontFamily: "Fraunces_700Bold",
                        fontSize: 15,
                      }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempEndDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={startDate}
                  onChange={(_, date) => {
                    if (date) {
                      setTempEndDate(date);
                      if (Platform.OS === "android") {
                        setEndDate(date);
                        setShowEndPicker(false);
                      }
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
