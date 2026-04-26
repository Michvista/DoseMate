// components/meds/AllMedicationsTab.tsx
import { MedicationIcons } from "@/lib/MedicationIcons";
import { APIMedication } from "@/lib/api/types";
import { useMedications } from "@/lib/hooks/useMedications";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TYPE_COLORS: Record<string, string> = {
  pill: "#9333EA",
  capsule: "#EF4444",
  liquid: "#3B82F6",
  injection: "#F59E0B",
  patch: "#10B981",
};

const ICON_TYPES = ["All", "pill", "capsule", "liquid", "injection", "patch"];

interface Props {
  onAddPress: () => void;
  onEditPress: (med: APIMedication) => void;
}

export const AllMedicationsTab = ({ onAddPress, onEditPress }: Props) => {
  const { medications, loading, deleteMedication, toggleStatus } =
    useMedications();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filtered = medications.filter((med) => {
    const matchSearch =
      searchQuery === "" ||
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedFilter === "All" || med.type === selectedFilter;
    return matchSearch && matchType;
  });

  const handleDelete = (med: APIMedication) => {
    Alert.alert("Delete Medication", `Remove ${med.name} permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteMedication(med._id).catch((err) =>
            Alert.alert("Error", err.message),
          ),
      },
    ]);
  };

  const handleToggleStatus = (med: APIMedication) => {
    const next = med.status === "Active" ? "Inactive" : "Active";
    toggleStatus(med._id, next).catch((err) =>
      Alert.alert("Error", err.message),
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#9333EA" size="large" />
      </View>
    );
  }

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
              const isActive = selectedFilter === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelectedFilter(type);
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
      {selectedFilter !== "All" && (
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
              {selectedFilter}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFilter("All")}>
              <Feather name="x" size={11} color="#9333EA" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Medication cards */}
      {filtered.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Feather name="inbox" size={32} color="#C4B5FD" />
          <Text
            className="mt-3 text-gray-400 text-sm"
            style={{ fontFamily: "Fraunces_400Regular" }}>
            No medications found
          </Text>
        </View>
      ) : (
        filtered.map((med) => {
          const color = TYPE_COLORS[med.type] ?? "#9333EA";
          const Icon =
            (MedicationIcons as any)[med.type] ?? (MedicationIcons as any).pill;
          return (
            <View
              key={med._id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}>
              {/* Top row: type badge + actions */}
              <View className="flex-row justify-between items-center mb-3">
                <View
                  style={{
                    backgroundColor: color + "15",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "Fraunces_700Bold",
                      color,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}>
                    {med.type}
                  </Text>
                </View>
                <View className="flex-row gap-3 items-center">
                  {/* Status toggle */}
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(med)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 20,
                      backgroundColor:
                        med.status === "Active" ? "#D1FAE5" : "#F3F4F6",
                    }}>
                    <Text
                      style={{
                        fontSize: 9,
                        fontFamily: "Fraunces_700Bold",
                        color: med.status === "Active" ? "#10B981" : "#9CA3AF",
                      }}>
                      {med.status.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onEditPress(med)}>
                    <Feather name="edit-2" size={14} color="#9333EA" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(med)}>
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
                    backgroundColor: color + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Icon size={22} color={color} />
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
                      {med.dosage.value}
                      {med.dosage.unit} · {med.scheduleType}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Times row */}
              <View className="flex-row items-center gap-1.5 flex-wrap">
                <Feather name="clock" size={12} color="#9CA3AF" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontFamily: "Fraunces_400Regular",
                  }}>
                  {med.times.join("  ·  ")}
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

      {/* Live summary row */}
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
          {
            label: "TOTAL ACTIVE",
            value: String(
              medications.filter((m) => m.status === "Active").length,
            ).padStart(2, "0"),
          },
          {
            label: "DOSE TIMES",
            value: String(
              medications.reduce((a, m) => a + m.times.length, 0),
            ).padStart(2, "0"),
          },
          {
            label: "TOTAL MEDS",
            value: String(medications.length).padStart(2, "0"),
          },
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
