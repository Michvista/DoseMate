import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { useState } from "react";
import {
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

interface Props {
  onBack: () => void;
}

const GENDERS: Gender[] = ["Female", "Male", "Other"];

// Darker purple to match screenshot
const PURPLE = "#7C3AED";
const PURPLE_LIGHT = "#EDE9FE"; // lavender bg for gender card
const INPUT_BG = "#F5F3FF"; // very subtle purple tint on inputs

export const ProfileDetails = ({ onBack }: Props) => {
  const [image, setImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Chioma Adeyemi");
  const [email, setEmail] = useState("chioma.a@example.com");
  const [phone, setPhone] = useState("+234 802 345 6789");
  const [gender, setGender] = useState<Gender>("Female");
  const [dob, setDob] = useState<Date>(new Date("1994-05-12"));
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [tempDob, setTempDob] = useState<Date>(new Date("1994-05-12"));

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
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <Reanimated.View
      entering={SlideInRight.springify().damping(22).stiffness(200)}
      exiting={SlideOutRight.duration(220)}
      style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* ── Header ── */}
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
          {/* ── Avatar ── */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 16,
              paddingBottom: 24,
              gap: 12,
            }}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
              <Image
                source={
                  image
                    ? { uri: image }
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
                {fullName}
              </Text>
            </View>
          </View>

          {/* ── Full Name ── */}
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

          {/* ── Email ── */}
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
              EMAIL ADDRESS
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              style={{
                fontSize: 16,
                fontFamily: "Fraunces_400Regular",
                color: "#1A0A2E",
              }}
            />
          </View>

          {/* ── Phone ── */}
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

          {/* ── Gender — lavender bg, white pill for active ── */}
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
                      // Shadow only on active pill so it "pops"
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

          {/* ── Date of Birth ── */}
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
        </ScrollView>

        {/* ── Save button ── */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 16,
            backgroundColor: "#fff",
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: PURPLE,
              borderRadius: 999,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}>
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
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── DOB picker modal ── */}
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
