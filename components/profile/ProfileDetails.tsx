// components/profile/ProfileDetails.tsx
import { useProfile } from "@/lib/hooks/useProfile";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import Reanimated, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

type Gender = "Female" | "Male" | "Other";
const GENDERS: Gender[] = ["Female", "Male", "Other"];
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE";
const INPUT_BG = "#F5F3FF";

interface Props {
  onBack: () => void;
}

export const ProfileDetails = ({ onBack }: Props) => {
  const { user, saving, updateProfile, uploadAvatar } = useProfile();

  // Local form state — seeded from API user once loaded
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("Female");
  const [dob, setDob] = useState<Date>(new Date("1990-01-01"));
  const [tempDob, setTempDob] = useState<Date>(dob);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Seed form fields once user data arrives
  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setPhone(user.phoneNumber ?? "");
      setGender((user.gender as Gender) ?? "Female");
      if (user.dateOfBirth) setDob(new Date(user.dateOfBirth));
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to change your avatar.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        setUploadingAvatar(true);
        await uploadAvatar(result.assets[0].uri);
      } catch (err: any) {
        Alert.alert("Upload failed", err.message);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing", "Please enter your full name.");
      return;
    }
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        gender,
        dateOfBirth: dob.toISOString(),
      });
      Alert.alert("Saved ✓", "Your profile has been updated.");
      onBack();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not save profile.");
    }
  };

  return (
    <Reanimated.View
      entering={SlideInRight.springify().damping(22).stiffness(200)}
      exiting={SlideOutRight.duration(220)}
      style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 56,
            paddingBottom: 16,
          }}>
          <TouchableOpacity onPress={onBack}>
            <Feather name="arrow-left" size={20} color={PURPLE} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Fraunces_700Bold",
              color: PURPLE,
            }}>
            Profile Details
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 20,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 16,
              paddingBottom: 24,
              gap: 12,
            }}>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.85}
              disabled={uploadingAvatar}>
              {uploadingAvatar ? (
                <View
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor: PURPLE_LIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <ActivityIndicator color={PURPLE} />
                </View>
              ) : (
                <Image
                  source={
                    user?.profileImage
                      ? { uri: user.profileImage }
                      : require("@/assets/images/faceCard.jpg")
                  }
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    borderWidth: 3,
                    borderColor: PURPLE,
                  }}
                />
              )}
              <View
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: PURPLE,
                  borderRadius: 20,
                  padding: 8,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}>
                <Feather name="edit-2" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={{ alignItems: "center", gap: 2 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Fraunces_700Bold",
                  color: "#9CA3AF",
                  letterSpacing: 2,
                }}>
                ACCOUNT HOLDER
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Fraunces_700Bold",
                  color: "#1A0A2E",
                }}>
                {user?.fullName ?? fullName}
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <View
            style={{
              backgroundColor: INPUT_BG,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 2,
                color: "#9CA3AF",
                marginBottom: 4,
              }}>
              FULL NAME
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              returnKeyType="next"
              style={{
                fontSize: 16,
                fontFamily: "Fraunces_400Regular",
                color: "#1A0A2E",
              }}
            />
          </View>

          {/* Email — read only */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 2,
                color: "#9CA3AF",
                marginBottom: 4,
              }}>
              EMAIL ADDRESS
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Fraunces_400Regular",
                color: "#9CA3AF",
              }}>
              {user?.email ?? ""}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#CBD5E1",
                fontFamily: "Fraunces_400Regular",
                marginTop: 2,
              }}>
              Email cannot be changed
            </Text>
          </View>

          {/* Phone */}
          <View
            style={{
              backgroundColor: INPUT_BG,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 2,
                color: "#9CA3AF",
                marginBottom: 4,
              }}>
              PHONE NUMBER
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              style={{
                fontSize: 16,
                fontFamily: "Fraunces_400Regular",
                color: "#1A0A2E",
              }}
            />
          </View>

          {/* Gender */}
          <View
            style={{
              backgroundColor: PURPLE_LIGHT,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 14,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 2,
                color: PURPLE,
                marginBottom: 10,
              }}>
              GENDER SELECTION
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {GENDERS.map((g) => {
                const isActive = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 999,
                      alignItems: "center",
                      backgroundColor: isActive ? "#fff" : "transparent",
                      shadowColor: isActive ? PURPLE : "transparent",
                      shadowOpacity: isActive ? 0.15 : 0,
                      shadowRadius: isActive ? 8 : 0,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: isActive ? 3 : 0,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: isActive
                          ? "Fraunces_700Bold"
                          : "Fraunces_400Regular",
                        color: isActive ? PURPLE : "#6B7280",
                      }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date of Birth */}
          <TouchableOpacity
            onPress={() => {
              setTempDob(dob);
              setShowDobPicker(true);
            }}
            style={{
              backgroundColor: INPUT_BG,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 14,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Fraunces_700Bold",
                letterSpacing: 2,
                color: "#9CA3AF",
                marginBottom: 4,
              }}>
              DATE OF BIRTH
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Fraunces_400Regular",
                  color: "#1A0A2E",
                }}>
                {format(dob, "d MMMM yyyy")}
              </Text>
              <Feather name="calendar" size={18} color={PURPLE} />
            </View>
          </TouchableOpacity>

          {/* Save button */}
          <View style={{ paddingTop: 4, paddingBottom: 40 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: PURPLE,
                borderRadius: 999,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: saving ? 0.6 : 1,
              }}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 15,
                      fontFamily: "Fraunces_700Bold",
                      letterSpacing: 0.5,
                    }}>
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DOB picker modal */}
      <Modal
        visible={showDobPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDobPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDobPicker(false)}>
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
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 48,
                }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}>
                  <TouchableOpacity onPress={() => setShowDobPicker(false)}>
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
                    Date of Birth
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setDob(tempDob);
                      setShowDobPicker(false);
                    }}>
                    <Text
                      style={{
                        color: PURPLE,
                        fontSize: 15,
                        fontFamily: "Fraunces_700Bold",
                      }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDob}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    if (date) {
                      setTempDob(date);
                      if (Platform.OS === "android") {
                        setDob(date);
                        setShowDobPicker(false);
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
    </Reanimated.View>
  );
};
