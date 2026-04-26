// app/(tabs)/profile.tsx
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { useProfile } from "@/lib/hooks/useProfile";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

const Page = () => {
  const { user, loading, uploadAvatar, updateSettings } = useProfile();
  const [showDetails, setShowDetails] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos.");
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

  const handleToggle = async (
    key: "highPriorityAlarms" | "dailyReminders",
    value: boolean,
  ) => {
    try {
      await updateSettings({ [key]: value });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (showDetails) {
    return <ProfileDetails onBack={() => setShowDetails(false)} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#9333EA" />
      </View>
    );
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={{ flex: 1, backgroundColor: "#fff", paddingTop: 56 }}
      className="p-2">
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
        {/* ── Avatar card ── */}
        <View className="mx-2 border border-lighter rounded-[3rem]">
          <View className="flex py-8 flex-col items-center justify-center gap-4 pb-10">
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              disabled={uploadingAvatar}
              className="relative">
              {uploadingAvatar ? (
                <View
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: "#EDE9FE",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <ActivityIndicator color="#9333EA" />
                </View>
              ) : (
                <Image
                  source={
                    user?.profileImage
                      ? { uri: user.profileImage }
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
              )}
              <View
                className="absolute"
                style={{
                  bottom: 5,
                  right: 5,
                  backgroundColor: "#8B5CF6",
                  borderRadius: 20,
                  padding: 8,
                  elevation: 5,
                }}>
                <Feather name="edit-2" size={18} color="#fff" />
              </View>
            </TouchableOpacity>

            <View className="text-center items-center gap-2">
              <Text
                className="text-2xl"
                style={{ fontFamily: "Fraunces_700Bold" }}>
                {user?.fullName ?? "Guest User"}
              </Text>
              <Text
                className="text-gray-700"
                style={{ fontFamily: "Fraunces_400Regular" }}>
                {user?.email ?? ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowDetails(true)}>
            <View className="flex items-center justify-center">
              <View className="mb-12 w-[90%] flex flex-col items-center justify-center bg-lighter p-4 rounded-full">
                <View className="flex-row items-center gap-6">
                  <View className="p-3 bg-dose-upcomingText rounded-full">
                    <MaterialCommunityIcons
                      name="face-man-profile"
                      size={20}
                      color="#fff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "Fraunces_400Regular" }}>
                      Profile Details
                    </Text>
                    <Text
                      className="text-base"
                      style={{ fontFamily: "Fraunces_700Bold" }}>
                      Name, phone and DOB
                    </Text>
                  </View>
                  <Entypo
                    name="chevron-small-right"
                    size={22}
                    color="#9333EA"
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Notifications section ── */}
        <Text
          className="text-gray-700 uppercase p-6"
          style={{ fontFamily: "Fraunces_700Bold" }}>
          notifications
        </Text>

        <View className="mx-4 border border-lighter rounded-[2.5rem] p-4">
          {/* High-priority */}
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
              thumbColor={
                user?.settings.highPriorityAlarms ? "#fff" : "#f4f3f4"
              }
              onValueChange={(v) => handleToggle("highPriorityAlarms", v)}
              value={user?.settings.highPriorityAlarms ?? false}
            />
          </View>

          {/* Daily reminders */}
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
              thumbColor={user?.settings.dailyReminders ? "#fff" : "#f4f3f4"}
              onValueChange={(v) => handleToggle("dailyReminders", v)}
              value={user?.settings.dailyReminders ?? true}
            />
          </View>
        </View>
      </ScrollView>
    </Reanimated.View>
  );
};

export default Page;
