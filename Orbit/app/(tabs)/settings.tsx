import {
  Text,
  View,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  const email = user?.email || "";

  // 🔥 FETCH PROFILE
  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, name")
      .eq("id", user.id)
      .single();

    if (data) {
      setAvatarUrl(data.avatar_url);
      setName(data.name || "");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // 🔥 UPDATE NAME
  const updateName = async () => {
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);

    setEditing(false);
  };

  // 🔥 PICK IMAGE
  const pickImage = async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (result.canceled) return;

    const image = result.assets[0];
    const filePath = `${user.id}.jpg`;

    const response = await fetch(image.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) return;

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);
  };

  // 🔥 REMOVE IMAGE
  const removeAvatar = async () => {
    if (!user) return;

    const filePath = `${user.id}.jpg`;

    await supabase.storage.from("avatars").remove([filePath]);

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    setAvatarUrl(null);
  };

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 🔥 PREVENT NULL ERROR
  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary mb-6">
        Settings
      </Text>

      {/* PROFILE */}
      <View className="auth-card mb-5">
        <View className="flex-row items-center gap-4 mb-4">

          {/* IMAGE */}
          <Pressable onPress={() => setIsAvatarModalVisible(true)}>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("@/assets/images/fallback.png")
              }
              className="size-16 rounded-full"
            />
          </Pressable>

          <View className="flex-1">
            {editing ? (
              <TextInput
                value={name}
                onChangeText={setName}
                className="border p-2 rounded text-primary"
              />
            ) : (
              <Text className="text-lg font-sans-bold text-primary">
                {name || "Set your name"}
              </Text>
            )}

            <Text className="text-sm text-muted-foreground">
              {email}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (editing) updateName();
              else setEditing(true);
            }}
          >
            <Text className="text-primary">
              {editing ? "Save" : "Edit"}
            </Text>
          </Pressable>
        </View>

        <Text className="text-xs text-muted-foreground">
          Tap image to change or remove profile picture
        </Text>
      </View>

      {/* ACCOUNT */}
      <View className="auth-card mb-5">
        <Text className="text-base font-sans-semibold text-primary mb-3">
          Account
        </Text>

        <View className="gap-2">
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Account ID
            </Text>
            <Text className="text-sm text-primary">
              {user.id.slice(0, 8)}...
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-muted-foreground">
              Joined
            </Text>
            <Text className="text-sm text-primary">
              {new Date(user.created_at).toDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* LOGOUT */}
      <Pressable
        className="auth-button bg-red-500"
        onPress={handleLogout}
      >
        <Text className="auth-button-text text-white">
          Logout
        </Text>
      </Pressable>

      {/* 🔥 CENTER MODAL WITH BLUR */}
      {isAvatarModalVisible && (
        <View className="absolute inset-0 justify-center items-center">

          {/* BLUR */}
          <BlurView
            intensity={200}
            tint="dark"
            className="absolute inset-0"
          />

          {/* BACKDROP */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsAvatarModalVisible(false)}
          />

          {/* POPUP */}
          <View className="bg-card w-[85%] rounded-3xl p-5 gap-4 shadow-lg">

            <Text className="text-lg font-sans-bold text-primary text-center">
              Profile Photo
            </Text>

            <Pressable
              className="auth-button"
              onPress={() => {
                setIsAvatarModalVisible(false);
                pickImage();
              }}
            >
              <Text className="auth-button-text">Change Photo</Text>
            </Pressable>

            {avatarUrl && (
              <Pressable
                className="auth-button bg-red-500"
                onPress={() => {
                  setIsAvatarModalVisible(false);
                  removeAvatar();
                }}
              >
                <Text className="auth-button-text text-white">
                  Remove Photo
                </Text>
              </Pressable>
            )}

            <Pressable
              className="auth-button bg-border"
              onPress={() => setIsAvatarModalVisible(false)}
            >
              <Text className="auth-button-text text-primary">
                Cancel
              </Text>
            </Pressable>

          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Settings;