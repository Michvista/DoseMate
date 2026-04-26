// components/meds/EditMedicationScreen.tsx
import { MedicationIcons } from "@/lib/MedicationIcons";
import { APIMedication } from "@/lib/api/types";
import { useMedications } from "@/lib/hooks/useMedications";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ── Local types (self-contained, no lib/types dependency) ─────────────────────
type DoseTime = { id: string; time: Date; label: string };

// ── Schedule presets (local copy, no lib/data dependency) ─────────────────────
type ScheduleType = "Once Daily" | "Morning & Evening" | "Three Times";

const SCHEDULE_PRESETS: { label: string; apiValue: ScheduleType }[] = [
  { label: "ONCE DAILY", apiValue: "Once Daily" },
  { label: "MORNING & EVENING", apiValue: "Morning & Evening" },
  { label: "THREE TIMES", apiValue: "Three Times" },
];

// Maps backend scheduleType → preset array index
const PRESET_INDEX: Record<string, number> = {
  "Once Daily": 0,
  "Morning & Evening": 1,
  "Three Times": 2,
};

// Default dose rows per preset (used when the preset chip is tapped)
const PRESET_DEFAULTS: DoseTime[][] = [
  [{ id: "0", time: makeTime(8), label: "MORNING" }],
  [
    { id: "0", time: makeTime(8), label: "MORNING" },
    { id: "1", time: makeTime(20), label: "EVENING" },
  ],
  [
    { id: "0", time: makeTime(8), label: "MORNING" },
    { id: "1", time: makeTime(14), label: "AFTERNOON" },
    { id: "2", time: makeTime(20), label: "EVENING" },
  ],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeTime(h: number, m = 0): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** "HH:MM" string → Date set to today */
function parseHHMM(s: string): Date {
  const [h, m] = s.split(":").map(Number);
  return makeTime(h, m);
}

/** Date → "HH:MM" for the API */
function toHHMM(d: Date): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Date → "08:00 AM" for display */
function fmt(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Date → "MM/dd/yy" for display */
function fmtDate(d: Date): string {
  return format(d, "MM/dd/yy");
}

// ── Icon color by medication type ─────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  pill: "#9333EA",
  capsule: "#EF4444",
  liquid: "#3B82F6",
  injection: "#F59E0B",
  patch: "#10B981",
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  med: APIMedication;
  onBack: () => void;
  onSave?: (updated: APIMedication) => void;
}

export const EditMedicationScreen = ({ med, onBack, onSave }: Props) => {
  const { updateMedication } = useMedications();
  const [saving, setSaving] = useState(false);

  // Form state — pre-filled from the APIMedication passed in
  const [medName, setMedName] = useState(med.name);
  const [dosageValue, setDosageValue] = useState(String(med.dosage.value));
  const [notes, setNotes] = useState(med.notes ?? "");

  const [activePreset, setActivePreset] = useState(
    PRESET_INDEX[med.scheduleType] ?? 1,
  );

  // Parse existing "HH:MM" strings back into Date objects for the picker
  const [doses, setDoses] = useState<DoseTime[]>(
    med.times.map((t, i) => ({
      id: String(i),
      time: parseHHMM(t),
      label: ["MORNING", "AFTERNOON", "EVENING", "CUSTOM"][i] ?? "CUSTOM",
    })),
  );

  const [startDate, setStartDate] = useState<Date>(
    med.startDate ? new Date(med.startDate) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    med.endDate ? new Date(med.endDate) : null,
  );
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate ?? new Date());
  const [editingDose, setEditingDose] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePreset = (i: number) => {
    setActivePreset(i);
    setDoses(
      PRESET_DEFAULTS[i].map((d) => ({
        ...d,
        id: String(Date.now() + Math.random()),
      })),
    );
  };

  const addDose = () =>
    setDoses((p) => [
      ...p,
      { id: String(Date.now()), time: makeTime(12), label: "CUSTOM" },
    ]);

  const removeDose = (id: string) =>
    setDoses((p) => p.filter((d) => d.id !== id));

  const openTimePicker = (dose: DoseTime) => {
    setTempTime(dose.time);
    setEditingDose(dose.id);
  };

  const confirmTime = () => {
    if (!editingDose) return;
    setDoses((p) =>
      p.map((d) => (d.id === editingDose ? { ...d, time: tempTime } : d)),
    );
    setEditingDose(null);
  };

  const handleSave = async () => {
    if (!medName.trim())
      return Alert.alert("Missing", "Enter a medication name.");
    if (!dosageValue.trim()) return Alert.alert("Missing", "Enter a dosage.");

    try {
      setSaving(true);
      const updated = await updateMedication(med._id, {
        name: medName.trim(),
        dosage: { value: parseFloat(dosageValue), unit: med.dosage.unit },
        scheduleType: SCHEDULE_PRESETS[activePreset].apiValue,
        times: doses.map((d) => toHHMM(d.time)),
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        notes: notes.trim() || undefined,
      });
      if (updated && onSave) onSave(updated);
      else onBack();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived display values ───────────────────────────────────────────────────
  const iconColor = TYPE_COLORS[med.type] ?? "#9333EA";
  const MedIcon =
    (MedicationIcons as any)[med.type] ?? (MedicationIcons as any).pill;

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
          {format(new Date(med.updatedAt), "MMM d, yyyy")}
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
          {/* ── Icon preview ── */}
          <View
            style={{
              backgroundColor: iconColor + "20",
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 24,
              marginTop: 4,
            }}>
            <MedIcon size={48} color={iconColor} />
            <Text
              style={{
                fontSize: 10,
                color: iconColor,
                fontFamily: "Fraunces_700Bold",
                marginTop: 8,
                letterSpacing: 2,
              }}>
              {med.type.toUpperCase()}
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

          {/* ── Medication name ── */}
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

          {/* ── Dosage ── */}
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
              DOSAGE ({med.dosage.unit.toUpperCase()})
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={dosageValue}
                onChangeText={setDosageValue}
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
                  {med.dosage.unit}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Schedule ── */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
            }}>
            {/* Preset chips */}
            <View className="flex-row items-center justify-between mb-3 mr-4">
              <Text className="mr-4 pr-4"
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: "#9333EA",
                  fontFamily: "Fraunces_700Bold",
                }}>
                DAILY SCHEDULE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
              >
                  <View className="flex-row gap-3">
                {SCHEDULE_PRESETS.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handlePreset(i)}
                    className="px-2 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        activePreset === i ? "#9333EA" : "#EDE9FE",
                    }}>
                    <Text
                      style={{
                        fontFamily: "Fraunces_700Bold",
                        fontSize: 8,
                        color: activePreset === i ? "#fff" : "#9333EA",
                      }}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                  </View>
              </ScrollView>
            </View>

            {/* Dose time rows */}
            {doses.map((dose, idx) => (
              <TouchableOpacity
                key={dose.id}
                onPress={() => {
                  if (Platform.OS === "android") {
                    // Android shows picker inline — just open it
                    setTempTime(dose.time);
                    setEditingDose(dose.id);
                  } else {
                    openTimePicker(dose);
                  }
                }}
                className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <View className="flex-row items-center gap-3">
                  <Feather
                    name={idx === 0 ? "sun" : idx === 1 ? "moon" : "clock"}
                    size={16}
                    color="#9CA3AF"
                  />
                  <Text
                    style={{
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                      fontSize: 18,
                    }}>
                    {fmt(dose.time)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text
                    style={{
                      fontFamily: "Fraunces_400Regular",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}>
                    {dose.label}
                  </Text>
                  {doses.length > 1 && (
                    <TouchableOpacity onPress={() => removeDose(dose.id)}>
                      <Feather name="x" size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={addDose}
              className="mt-3 border border-dashed border-[#957DC2] rounded-xl py-3 items-center flex-row justify-center gap-2">
              <Feather name="plus" size={14} color="#957DC2" />
              <Text
                style={{
                  fontFamily: "Fraunces_700Bold",
                  fontSize: 13,
                  color: "#957DC2",
                }}>
                Add Another Dose
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Date range ── */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={{
                flex: 1,
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
                <Feather name="calendar" size={14} color="#9333EA" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={{
                flex: 1,
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
                END DATE
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontSize: 15,
                    color: endDate ? "#1A0A2E" : "#CBD5E1",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  {endDate ? fmtDate(endDate) : "mm/dd/yy"}
                </Text>
                <Feather name="calendar" size={14} color="#9333EA" />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Notes ── */}
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
              ADDITIONAL NOTES
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="Optional notes..."
              placeholderTextColor="#CBD5E1"
              style={{
                fontSize: 14,
                color: "#1A0A2E",
                fontFamily: "Fraunces_400Regular",
                textAlignVertical: "top",
                minHeight: 64,
              }}
            />
          </View>

          {/* ── Footer buttons ── */}
          <View style={{ gap: 10, paddingTop: 4 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: "#9333EA",
                borderRadius: 999,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.6 : 1,
              }}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Fraunces_700Bold",
                    fontSize: 15,
                    letterSpacing: 0.5,
                  }}>
                  Save Changes
                </Text>
              )}
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

      {/* ── Time picker modal ── */}
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
