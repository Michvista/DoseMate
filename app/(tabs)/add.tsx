import { Feather, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { JSX, useState } from "react";
import {
  KeyboardAvoidingView, // shifts content up when keyboard appears
  Modal, // renders content in a layer above everything
  Platform, // tells us if we're on iOS or Android
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback, // backdrop tap to close — doesn't consume child events
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useMedications } from "../../lib/hooks/useMedications";

import { MedicationIcons } from "../../lib/MedicationIcons";

import * as Notifications from "expo-notifications";

// ── Types ─────────────────────────────────────────────────────
type FormFactor = "pill" | "capsule" | "liquid" | "injection" | "patch";
type DoseTime = { id: string; time: Date; label: string };

// ── Form factor options — each carries its own dosage unit ────
const FORM_FACTORS: {
  value: FormFactor;
  label: string;
  sub: string;
  unit: string;
  icon: JSX.Element;
}[] = [
  {
    value: "pill",
    label: "Pill / Tablet",
    sub: "PILL / TABLET",
    unit: "mg",
    icon: <MedicationIcons.pill color="#E07B54" size={16} />,
  },
  {
    value: "capsule",
    label: "Capsule",
    sub: "CAPSULE",
    unit: "mg",
    icon: <MedicationIcons.capsule color="#E07B54" size={16} />,
  },
  {
    value: "liquid",
    label: "Liquid / Syrup",
    sub: "LIQUID / SYRUP",
    unit: "ml",
    icon: <MedicationIcons.syrup color="#E07B54" size={16} />,
  },
  {
    value: "injection",
    label: "Injection",
    sub: "INJECTION",
    unit: "ml",
    icon: <MedicationIcons.injection color="#E07B54" size={16} />,
  },
  {
    value: "patch",
    label: "Patch",
    sub: "PATCH",
    unit: "mcg",
    icon: <MedicationIcons.patch color="#E07B54" size={16} />,
  },
];

// Creates a Date object set to today at h:m — used for default dose times
const makeTime = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0); // set hours/minutes, zero out seconds+ms
  return d;
};

// Schedule presets — each preset defines how many dose rows to show by default
const SCHEDULE_PRESETS: { label: string; apiValue: string; times: Omit<DoseTime, "id">[] }[] = [
  { label: "ONCE DAILY", apiValue: "Once Daily", times: [{ time: makeTime(8), label: "MORNING" }] },
  {
    label: "MORNING & EVENING",
    apiValue: "Morning & Evening",
    times: [
      { time: makeTime(8), label: "MORNING" },
      { time: makeTime(20), label: "EVENING" },
    ],
  },
  {
    label: "THREE TIMES",
    apiValue: "Three Times",
    times: [
      { time: makeTime(8), label: "MORNING" },
      { time: makeTime(14), label: "AFTERNOON" },
      { time: makeTime(20), label: "EVENING" },
    ],
  },
];

// Formats a Date to "08:00 AM" style
const fmt = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Formats a Date to "04/06/26" or returns placeholder
const fmtDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    : "mm/dd/yy";

// ── Reusable date picker bottom sheet ────────────────────────
// Extracted to avoid repeating the same Modal JSX twice
const DatePickerSheet = ({
  visible,
  title,
  value,
  minimumDate,
  onClose,
  onChange,
}: {
  visible: boolean;
  title: string;
  value: Date;
  minimumDate?: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
}) =>
  // On Android use the native dialog (rendering DateTimePicker directly) and
  // skip our custom sheet. On iOS show the bottom sheet modal with spinner.
  Platform.OS === "android" ? null : (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* TouchableWithoutFeedback closes the sheet when tapping the dark backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}>
          {/* stopPropagation stops the backdrop tap from firing inside the sheet */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white rounded-t-3xl px-5 pt-4 pb-12">
              <View className="flex-row justify-between items-center mb-2">
                <TouchableOpacity onPress={onClose}>
                  <Text
                    className="text-gray-400 text-base"
                    style={{ fontFamily: "Fraunces_400Regular" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text
                  className="text-base font-bold text-dark"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text
                    className="text-tabs-100 text-base font-bold"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode="date"
                // spinner looks best in our sheet on iOS
                display={"spinner"}
                minimumDate={minimumDate}
                onChange={(_, date) => {
                  if (date) {
                    onChange(date);
                    // Android fires onChange immediately and doesn't need a Done button
                    if (Platform.OS === "android") onClose();
                  }
                }}
                style={{ width: "100%" }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

// ── Main page ─────────────────────────────────────────────────
const Page = () => {
  // Which form type is selected — controls the unit badge and dosage label
  const [formFactor, setFormFactor] = useState<FormFactor>("pill");
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");

  // activePreset tracks which chip is highlighted (0/1/2)
  const [activePreset, setActivePreset] = useState(1);

  // doses is the live array of time rows shown in Daily Schedule
  const [doses, setDoses] = useState<DoseTime[]>(
    SCHEDULE_PRESETS[1].times.map((t, i) => ({ ...t, id: String(i) })),
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");

  // editingDose = the id of the dose row whose time is being changed (null = picker closed)
  const [editingDose, setEditingDose] = useState<string | null>(null);
  // tempTime holds the in-progress picker value before the user taps Done
  const [tempTime, setTempTime] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  // Android-specific picker flags: render DateTimePicker directly (native dialog)
  const [showStartPickerAndroid, setShowStartPickerAndroid] = useState(false);
  const [showEndPickerAndroid, setShowEndPickerAndroid] = useState(false);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState<
    string | null
  >(null);

  const { addMedication } = useMedications();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Look up the full form factor object for the current selection
  const selectedForm = FORM_FACTORS.find((f) => f.value === formFactor)!;

  // Replace dose array with the preset's default times
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

  // Opens the time picker sheet for a specific dose row
  const openTimePicker = (dose: DoseTime) => {
    setTempTime(dose.time); // seed the picker with the dose's current time
    if (Platform.OS === "android") {
      // On Android show the native time dialog instead of our custom modal
      setShowAndroidTimePicker(dose.id);
    } else {
      setEditingDose(dose.id); // show the iOS modal
    }
  };

  const openStartPickerHandler = () => {
    if (Platform.OS === "android") setShowStartPickerAndroid(true);
    else setShowStartPicker(true);
  };

  const openEndPickerHandler = () => {
    if (Platform.OS === "android") setShowEndPickerAndroid(true);
    else setShowEndPicker(true);
  };

  // Writes tempTime back into the doses array
  const confirmTime = () => {
    if (!editingDose) return;
    setDoses((prev) =>
      prev.map((d) => (d.id === editingDose ? { ...d, time: tempTime } : d)),
    );
    setEditingDose(null); // close modal
  };

const handleSave = async () => {
  if (!medName.trim())
    return Alert.alert("Missing", "Enter a medication name.");
  if (!dosage || isNaN(parseFloat(dosage)))
    return Alert.alert("Missing", "Enter dosage.");
  if (doses.length === 0)
    return Alert.alert("Missing", "Add at least one time.");

  try {
    setSaving(true);

    // 1. Save Medication to Backend
    const newMed = await addMedication({
      name: medName.trim(),
      type: selectedForm.value,
      dosage: {
        value: parseFloat(dosage),
        unit: selectedForm.unit,
      },
      scheduleType: "Once Daily", // Ensure this matches your APIMedication type
      times: doses.map((d) =>
        d.time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      ),
      startDate: startDate?.toISOString() || new Date().toISOString(),
      endDate: endDate?.toISOString(),
      status: "Active",
    });

    // 2. Schedule Local Notifications
    for (const dose of doses) {
      const hours = dose.time.getHours();
      const minutes = dose.time.getMinutes();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Medication Reminder",
          body: `Time for your ${dosage}${selectedForm.unit} of ${medName}`,
          data: {
            screen: "Alarm",
            medicationName: medName,
            dosageValue: dosage,
            dosageUnit: selectedForm.unit,
            scheduledTime: dose.time.toISOString(),
            medicationId: newMed?._id, // Backend _id
          },
          categoryIdentifier: "DOSE_REMINDER",
        },
        trigger: {
          // USE THIS TYPE SPECIFICALLY
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: "dose-alarms",
        } as Notifications.DailyTriggerInput,
      });
    }

    router.back();
  } catch (err: any) {
    Alert.alert("Error", err.message);
  } finally {
    setSaving(false);
  }
};

  return (
    // KeyboardAvoidingView pushes content above the keyboard on iOS
    <KeyboardAvoidingView
      className="flex-1 bg-add-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled" // lets you tap inputs without first dismissing keyboard
        showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View className="px-5 pt-14 pb-6">
          <Text
            className="text-[11px] font-bold tracking-[3px] text-add-accent mb-1"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            NEW ENTRY
          </Text>
          <Text
            className="text-[32px] text-dark leading-tight"
            style={{ fontFamily: "Fraunces_700Bold" }}>
            Add New Med
          </Text>
          <Text
            className="text-sm text-gray-400 mt-1"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            Fill in the details below
          </Text>
        </View>

        <View className="px-4 gap-3">
          {/* ── Form Factor dropdown ── */}
          <View>
            <TouchableOpacity
              onPress={() => setShowFormPicker(!showFormPicker)}
              className="bg-add-peach rounded-2xl px-4 py-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center">
                  {selectedForm.icon}
                </View>
                <View>
                  <Text
                    className="text-base font-bold text-add-peach-text"
                    style={{ fontFamily: "Fraunces_700Bold" }}>
                    {selectedForm.label}
                  </Text>
                  <Text
                    className="text-[10px] font-bold tracking-widest"
                    style={{
                      fontFamily: "Fraunces_700Bold",
                      color: "#C4622D",
                      opacity: 0.6,
                    }}>
                    {selectedForm.sub}
                  </Text>
                </View>
              </View>
              <Feather
                name={showFormPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color="#E07B54"
              />
            </TouchableOpacity>

            {/* Inline dropdown list — shown/hidden by showFormPicker */}
            {showFormPicker && (
              <View className="bg-white rounded-2xl mt-1 overflow-hidden border border-gray-100">
                {FORM_FACTORS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => {
                      setFormFactor(f.value);
                      setShowFormPicker(false);
                    }}
                    className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${formFactor === f.value ? "bg-light1" : ""}`}>
                    <View className="w-8 h-8 rounded-lg bg-add-peach items-center justify-center mr-3">
                      {f.icon}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-dark"
                        style={{ fontFamily: "Fraunces_700Bold" }}>
                        {f.label}
                      </Text>
                      {/* Shows the unit so user knows what they're picking */}
                      <Text className="text-[10px] text-gray-400 tracking-widest">
                        Unit: {f.unit}
                      </Text>
                    </View>
                    {formFactor === f.value && (
                      <Feather name="check" size={16} color="#9333EA" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Medication name ── */}
          <View className="bg-white rounded-2xl px-4 pt-3 pb-2">
            <Text
              className="text-[10px] font-bold tracking-[2px] text-add-accent mb-1"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              MEDICATION NAME
            </Text>
            <TextInput
              value={medName}
              onChangeText={setMedName}
              placeholder="e.g. Paracetamol"
              placeholderTextColor="#CBD5E1"
              returnKeyType="next"
              className="text-base text-dark pb-1"
              style={{ fontFamily: "Fraunces_400Regular" }}
            />
          </View>

          {/* ── Dosage — label + placeholder update when form factor changes ── */}
          <View className="bg-white rounded-2xl px-4 pt-3 pb-2">
            {/* selectedForm.unit drives the label e.g. "DOSAGE (MG)" */}
            <Text
              className="text-[10px] font-bold tracking-[2px] text-add-accent mb-1"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              DOSAGE ({selectedForm.unit.toUpperCase()})
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder={`e.g. 500${selectedForm.unit}`}
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                returnKeyType="done"
                className="flex-1 text-base text-dark pb-1"
                style={{ fontFamily: "Fraunces_400Regular" }}
              />
              {/* Unit badge — updates reactively when form factor changes */}
              <View className="bg-add-schedule px-3 py-1 rounded-full">
                <Text
                  className="text-xs font-bold text-add-accent"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  {selectedForm.unit}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Daily Schedule ── */}
          <View className="bg-add-schedule rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-base font-bold text-dark pr-3"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                Daily Schedule
              </Text>
              {/* Horizontal scroll for preset chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View className="flex-row gap-2">
                  {SCHEDULE_PRESETS.map((p, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handlePreset(i)}
                      className={`px-3 py-1 rounded-full ${activePreset === i ? "bg-tabs-100" : "bg-white border border-gray-200"}`}>
                      <Text
                        className={`text-[9px] font-bold tracking-wide ${activePreset === i ? "text-white" : "text-gray-400"}`}
                        style={{ fontFamily: "Fraunces_700Bold" }}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="gap-2">
              {doses.map((dose) => (
                // Tapping the whole row opens the time picker for THIS dose
                <TouchableOpacity
                  key={dose.id}
                  onPress={() => openTimePicker(dose)}
                  className="bg-white rounded-xl px-4 py-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-add-schedule items-center justify-center">
                      {dose.label === "MORNING" ? (
                        <Feather name="sun" size={16} color="#957DC2" />
                      ) : dose.label === "EVENING" ? (
                        <Feather name="moon" size={16} color="#957DC2" />
                      ) : (
                        <Feather name="clock" size={16} color="#957DC2" />
                      )}
                    </View>
                    {/* Shows the confirmed time — updates after Done is tapped */}
                    <Text
                      className="text-base font-bold text-dark"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      {fmt(dose.time)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-[10px] font-bold tracking-widest text-gray-400"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      {dose.label}
                    </Text>
                    <Feather name="edit-2" size={12} color="#CBD5E1" />
                    {doses.length > 1 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeDose(dose.id);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Feather name="x" size={14} color="#CBD5E1" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={addDose}
              className="mt-3 border border-dashed border-add-accent rounded-xl py-3 items-center flex-row justify-center gap-2">
              <Feather name="plus" size={14} color="#957DC2" />
              <Text
                className="text-sm text-add-accent font-semibold"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                Add Another Dose
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Date range ── */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={openStartPickerHandler}
              className="flex-1 bg-white rounded-2xl px-4 pt-3 pb-3">
              <Text
                className="text-[10px] font-bold tracking-[2px] text-add-accent mb-1"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                START DATE
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-base ${startDate ? "text-dark" : "text-gray-300"}`}
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {fmtDate(startDate)}
                </Text>
                <Feather name="calendar" size={14} color="#957DC2" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openEndPickerHandler}
              className="flex-1 bg-white rounded-2xl px-4 pt-3 pb-3">
              <Text
                className="text-[10px] font-bold tracking-[2px] text-add-accent mb-1"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                END DATE
              </Text>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-base ${endDate ? "text-dark" : "text-gray-300"}`}
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  {fmtDate(endDate)}
                </Text>
                <Feather name="calendar" size={14} color="#957DC2" />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Notes ── */}
          <View className="bg-white rounded-2xl px-4 pt-3 pb-3">
            <Text
              className="text-[10px] font-bold tracking-[2px] text-add-accent mb-1"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              ADDITIONAL NOTES
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Take after breakfast and dinner with a full glass of water..."
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={3}
              className="text-sm text-dark leading-5"
              style={{
                fontFamily: "Fraunces_400Regular",
                textAlignVertical: "top",
                minHeight: 72,
              }}
            />
          </View>
        </View>
      {/* ── Sticky footer ── */}
      <View className=" px-4 pb-10 pt-4 bg-add-bg">
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="bg-tabs-100 rounded-full py-4 items-center mb-3 flex-row justify-center"
          style={{ opacity: saving ? 0.6 : 1 }}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className="text-white text-base font-bold tracking-wide"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              Save Medication
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.back()}>
          <Text
            className="text-gray-400 text-sm"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>


      {/* ── Time picker modal (iOS only) ── */}
      {Platform.OS === "ios" && (
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
                <View className="bg-white rounded-t-3xl px-5 pt-4 pb-12">
                  <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => setEditingDose(null)}>
                      <Text
                        className="text-gray-400 text-base"
                        style={{ fontFamily: "Fraunces_400Regular" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text
                      className="text-base font-bold text-dark"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Set Time
                    </Text>
                    {/* Done writes tempTime into the doses array */}
                    <TouchableOpacity onPress={confirmTime}>
                      <Text
                        className="text-tabs-100 text-base font-bold"
                        style={{ fontFamily: "Fraunces_700Bold" }}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    // onChange fires on every drum scroll — we just store it in tempTime
                    // nothing commits until Done is pressed
                    onChange={(_, date) => {
                      if (date) setTempTime(date);
                    }}
                    style={{ width: "100%" }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* ── Android native pickers — render DateTimePicker directly so OS shows
           native dialog (no custom modal layering). These appear only when
           the corresponding show*Android flag is true. */}
      {showStartPickerAndroid && (
        <DateTimePicker
          value={startDate ?? new Date()}
          mode="date"
          display="default"
          minimumDate={undefined}
          onChange={(_, date) => {
            setShowStartPickerAndroid(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndPickerAndroid && (
        <DateTimePicker
          value={endDate ?? new Date()}
          mode="date"
          display="default"
          minimumDate={startDate ?? undefined}
          onChange={(_, date) => {
            setShowEndPickerAndroid(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {showAndroidTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="default"
          onChange={(_, date) => {
            // close the dialog first
            const id = showAndroidTimePicker;
            setShowAndroidTimePicker(null);
            if (date && id) {
              // commit immediately on Android
              setDoses((prev) =>
                prev.map((d) => (d.id === id ? { ...d, time: date } : d)),
              );
            }
          }}
        />
      )}

      {/* ── Date pickers — reuse DatePickerSheet component ── */}
      <DatePickerSheet
        visible={showStartPicker}
        title="Start Date"
        value={startDate ?? new Date()}
        onClose={() => setShowStartPicker(false)}
        onChange={(date) => setStartDate(date)}
      />
      <DatePickerSheet
        visible={showEndPicker}
        title="End Date"
        value={endDate ?? new Date()}
        minimumDate={startDate ?? undefined} // can't pick end before start
        onClose={() => setShowEndPicker(false)}
        onChange={(date) => setEndDate(date)}
      />
    </KeyboardAvoidingView>
  );
};

export default Page;

