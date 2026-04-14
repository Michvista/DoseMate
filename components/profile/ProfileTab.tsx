import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationSettings {
  highPriority: boolean;
  dailyReminders: boolean;
  marketing: boolean;
}

const Page = () => {
  const [image, setImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    highPriority: false,
    dailyReminders: true,
    marketing: false,
  });

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to change your avatar.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1  p-2 pt-14 bg-white">
      <View className="px-4 pb-8">
        <Text
          className="text-2xl text-dark"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          Profile and Settings
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}>
        <View className="mx-2 border border-lighter rounded-[3rem]">
          <View className="flex py-8  flex-col items-center justify-center avatar-text gap-4 pb-10">
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              className="relative">
              {/* Main Avatar Image */}
              <Image
                source={
                  image
                    ? { uri: image }
                    : require("@/assets/images/faceCard.jpg")
                }
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  borderColor: "#8B5CF6",
                  borderWidth: 2,
                  backgroundColor: "#eee",
                }}
              />

              {/* Edit Icon Overlay */}
              <View
                className="absolute"
                style={{
                  bottom: 5,
                  right: 5,
                  backgroundColor: "#8B5CF6",
                  borderRadius: 20,
                  padding: 8,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                }}>
                <Feather name="edit-2" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            <View className="text-center items-center gap-2">
              <Text
                className="text-2xl "
                style={{ fontFamily: "Fraunces_700Bold" }}>
                {" "}
                Chioma Adeyemi
              </Text>
              <Text
                className="text-gray-700"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                {" "}
                chioma@gmail.com
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <View className="flex items-center justify-center">
              <View className="profile-deetscard mb-12 w-[90%] flex flex-col items-center justify-center bg-lighter p-4 rounded-full">
                <View className="flex-row items-center gap-6">
                  <View className="p-3 bg-dose-upcomingText rounded-full">
                    <MaterialCommunityIcons
                      name="face-man-profile"
                      size={20}
                      color="#fff"
                    />
                  </View>
                  <View>
                    <Text
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "Fraunces_400Regular" }}>
                      Profile Details
                    </Text>
                    <Text
                      className="text-base "
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Name, phone and DOB
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity>
                      <Entypo
                        name="chevron-small-right"
                        size={18}
                        color="#9333EA"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text
          className="text-gray-700 uppercase p-6"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          notifications
        </Text>

        {/* Updated Notifications Container */}
        <View className="mx-4 border border-lighter rounded-[2.5rem] p-4">
          {/* Notification Item 1 */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-missedlight rounded-2xl">
                <MaterialCommunityIcons
                  name="bell-alert-outline"
                  size={20}
                  color="#EF4444"
                />
              </View>
              <View>
                <Text
                  className="text-base"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  High-priority Alarms
                </Text>
                <Text
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  Critical dose alerts
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={settings.highPriority ? "#fff" : "#f4f3f4"}
              onValueChange={() => toggleSetting("highPriority")}
              value={settings.highPriority}
            />
          </View>

          {/* Notification Item 2 */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-greenLight rounded-2xl">
                <MaterialCommunityIcons
                  name="bell-ring-outline"
                  size={20}
                  color="#22C55E"
                />
              </View>
              <View>
                <Text
                  className="text-base"
                  style={{ fontFamily: "Fraunces_700Bold" }}>
                  Daily Reminders
                </Text>
                <Text
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "Fraunces_400Regular" }}>
                  Morning schedule brief
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={settings.dailyReminders ? "#fff" : "#f4f3f4"}
              onValueChange={() => toggleSetting("dailyReminders")}
              value={settings.dailyReminders}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
