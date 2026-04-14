import { ActiveMedsTab } from "@/components/meds/ActiveMedsTab";
import { AllMedicationsTab } from "@/components/meds/AllMedicationsTab";
import { DoseHistoryTab } from "@/components/meds/DoseHistoryTab";
import { EditMedicationScreen } from "@/components/meds/EditMedicationScreen";
import { MedsTabBar } from "@/components/meds/MedsTabBar";
import { Medication } from "@/lib/types";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Reanimated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

const TABS = ["All Medications", "Dose History"];

const Page = () => {
  const [view, setView] = useState<"home" | "tabs">("home");
  const [activeTab, setActiveTab] = useState(0);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const handleAdd = () => router.push("/(tabs)/add");
  const handleEdit = (med: Medication) => setEditingMed(med);
  const handleBack = () => {
    setEditingMed(null);
    setView("tabs");
  };

  // ── Full-screen edit view — slides in from the right ─────────
  if (editingMed) {
    return (
      <Reanimated.View
        entering={SlideInRight.springify().damping(22).stiffness(200)}
        exiting={SlideOutRight.duration(250)}
        style={{ flex: 1 }}>
        <EditMedicationScreen
          med={editingMed}
          onBack={handleBack}
          onSave={(updated) => {
            console.log("Saved:", updated);
            handleBack();
          }}
        />
      </Reanimated.View>
    );
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(180)}
      style={{ flex: 1 }}
      className="bg-[#F8F6FF] pt-14">
      {/* ── Header ── */}
      <View className="px-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {view === "tabs" && (
            <TouchableOpacity
              onPress={() => setView("home")}
              className="w-9 h-9 rounded-full items-center justify-center bg-[#EDE9FE]">
              <Feather name="arrow-left" size={18} color="#9333EA" />
            </TouchableOpacity>
          )}
          <View>
            <Text
              className="text-2xl text-dark"
              style={{ fontFamily: "Fraunces_700Bold" }}>
              My Medications
            </Text>
            <Text
              className="text-xs text-gray-400"
              style={{ fontFamily: "Fraunces_400Regular" }}>
              Manage your active prescriptions and vitamins
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          className="w-9 h-9 rounded-full bg-tabs-100 items-center justify-center">
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {view === "home" ? (
        <ActiveMedsTab
          onViewAllPress={() => {
            setActiveTab(0);
            setView("tabs");
          }}
        />
      ) : (
        <>
          <MedsTabBar
            tabs={TABS}
            activeIndex={activeTab}
            onPress={setActiveTab}
          />
          {activeTab === 0 ? (
            <AllMedicationsTab
              onAddPress={handleAdd}
              onEditPress={handleEdit}
            />
          ) : (
            <DoseHistoryTab />
          )}
        </>
      )}
    </Reanimated.View>
  );
};

export default Page;
