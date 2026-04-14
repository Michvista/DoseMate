import { MedicationIcons } from "@/lib/MedicationIcons";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ACTIVE_MEDS } from "../../lib/data";
import { CATEGORY_COLORS, Medication } from "../../lib/types";

// Derive icon types from MedicationIcons keys
const ICON_TYPES = [
  "All",
  "pill",
  "capsule",
  "syrup",
  "injection",
  "patch",
];

interface AllMedicationsTabProps {
  onAddPress: () => void;
  onEditPress: (med: Medication) => void;
}

export const AllMedicationsTab = ({
  onAddPress,
  onEditPress,
}: AllMedicationsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedIconFilter, setSelectedIconFilter] = useState("All");

  const filteredMeds = ACTIVE_MEDS.filter((med) => {
    const matchesSearch =
      searchQuery === "" ||
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIcon =
      selectedIconFilter === "All" ||
      (med.icon ?? "pill").toLowerCase() === selectedIconFilter.toLowerCase();

    return matchesSearch && matchesIcon;
  });

  return (
    <ScrollView
      className="flex-1 px-3 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
      keyboardShouldPersistTaps="handled">
      {/* Search bar */}
      <View className="relative z-50">
        <View
          className="flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <Feather name="search" size={15} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search medications..."
            placeholderTextColor="#CBD5E1"
            className="flex-1"
            style={{
              fontSize: 13,
              color: "#1A0A2E",
              fontFamily: "Fraunces_400Regular",
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          <TouchableOpacity
            onPress={() => setShowFilterDropdown((v) => !v)}
            style={{
              backgroundColor: showFilterDropdown ? "#7C3AED" : "#9333EA",
              borderRadius: 10,
              padding: 6,
            }}>
            <Feather name="sliders" size={13} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter dropdown */}
        {showFilterDropdown && (
          <View
            className="absolute top-14 right-0 bg-white rounded-2xl overflow-hidden z-50"
            style={{
              width: 180,
              shadowColor: "#9333EA",
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 20,
              zIndex:50
            }}>
            <View className="px-4 pt-3 pb-1">
              <Text
                style={{
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: "#9333EA",
                  fontFamily: "Fraunces_700Bold",
                }}>
                FILTER BY TYPE
              </Text>
            </View>
            {ICON_TYPES.map((type) => {
              const isActive = selectedIconFilter === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelectedIconFilter(type);
                    setShowFilterDropdown(false);
                  }}
                  className="flex-row items-center gap-3 px-4 py-3"
                  style={{
                    backgroundColor: isActive ? "#F5F3FF" : "transparent",
                  }}>
                  {type !== "All" && (MedicationIcons as any)[type] ? (
                    (() => {
                      const Icon = (MedicationIcons as any)[type];
                      return (
                        <Icon
                          size={14}
                          color={isActive ? "#9333EA" : "#9CA3AF"}
                        />
                      );
                    })()
                  ) : (
                    <Feather
                      name="list"
                      size={14}
                      color={isActive ? "#9333EA" : "#9CA3AF"}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: isActive
                        ? "Fraunces_700Bold"
                        : "Fraunces_400Regular",
                      color: isActive ? "#9333EA" : "#374151",
                      textTransform: "capitalize",
                    }}>
                    {type}
                  </Text>
                  {isActive && (
                    <View className="ml-auto">
                      <Feather name="check" size={12} color="#9333EA" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Active filter chip */}
      {selectedIconFilter !== "All" && (
        <View className="flex-row items-center gap-2">
          <View
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#EDE9FE" }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Fraunces_700Bold",
                color: "#9333EA",
                textTransform: "capitalize",
              }}>
              {selectedIconFilter}
            </Text>
            <TouchableOpacity onPress={() => setSelectedIconFilter("All")}>
              <Feather name="x" size={11} color="#9333EA" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Medication cards */}
      {filteredMeds.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Feather name="inbox" size={32} color="#C4B5FD" />
          <Text
            className="mt-3 text-gray-400 text-sm"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            No medications found
          </Text>
        </View>
      ) : (
        filteredMeds.map((med) => {
          const catColor = CATEGORY_COLORS[med.category ?? ""] ?? med.color;
          return (
            <View
              key={med.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}>
              {/* Top row: category + actions */}
              <View className="flex-row justify-between items-center mb-3">
                <View
                  style={{
                    backgroundColor: catColor + "15",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "Fraunces_700Bold",
                      color: catColor,
                      letterSpacing: 1,
                    }}>
                    {med.category ?? "MEDICATION"}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => onEditPress(med)}>
                    <Feather name="edit-2" size={14} color="#9333EA" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Icon + name */}
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: catColor + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {(() => {
                    const Icon =
                      (MedicationIcons as any)[med.icon || "pill"] ??
                      (MedicationIcons as any).pill;
                    return <Icon size={22} color={catColor} />;
                  })()}
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Fraunces_700Bold",
                      color: "#1A0A2E",
                    }}>
                    {med.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Feather name="package" size={11} color="#9CA3AF" />
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontFamily: "Fraunces_400Regular",
                      }}>
                      {med.dosage}
                      {med.unit} · {med.frequency}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Next dose row */}
              <View className="flex-row items-center gap-1.5">
                <Feather name="clock" size={12} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  Next: {med.nextDose}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {/* Add New Medication card */}
      <TouchableOpacity
        onPress={onAddPress}
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#C4B5FD",
          gap: 8,
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#EDE9FE",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Feather name="plus" size={18} color="#9333EA" />
        </View>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Fraunces_700Bold",
            color: "#9333EA",
          }}>
          Add New Medication
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            fontFamily: "Fraunces_400Regular",
          }}>
          Tap here to add a new prescription or supplement
        </Text>
      </TouchableOpacity>

      {/* Summary row */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}>
        {[
          { label: "TOTAL ACTIVE", value: "04" },
          { label: "DUE TODAY", value: "07" },
          { label: "ADHERENCE", value: "94%" },
        ].map((item) => (
          <View key={item.label} style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Fraunces_700Bold",
                color: "#1A0A2E",
              }}>
              {item.value}
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: "#9CA3AF",
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 1,
                marginTop: 2,
              }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
