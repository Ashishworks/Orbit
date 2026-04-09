import { View, TextInput, Pressable, Text, Alert, Image, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images"; 
import "@/global.css";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    // 🔹 This creates the smooth transition when the "Name" field appears/disappears
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLogin(!isLogin);
  };

  const handleAuth = async () => {
    if (isLogin) await handleLogin();
    else await handleSignUp();
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { Alert.alert("Error", error.message); setLoading(false); return; }
    if (data.user) await supabase.from("profiles").update({ name }).eq("id", data.user.id);
    router.replace("/");
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { Alert.alert("Error", error.message); setLoading(false); return; }
    router.replace("/");
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b] p-6"> 
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        
        {/* HEADER */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-zinc-800 rounded-3xl items-center justify-center mb-4 border border-zinc-700">
            <Image source={images.avatar} className="w-16 h-16 rounded-2xl" />
          </View>
          <Text className="text-white text-3xl font-bold tracking-tight">
            {isLogin ? "Glad to see you!" : "Create Account"}
          </Text>
          <Text className="text-zinc-400 mt-2 text-center text-base">
            {isLogin ? "Sign in to manage your subs." : "Join us to start tracking expenses."}
          </Text>
        </View>

        {/* FORM */}
        <View className="gap-y-4">
          {!isLogin && (
            <View>
              <Text className="text-zinc-100 font-medium mb-2 ml-1">Full Name</Text>
              <TextInput
                placeholder="Name"
                placeholderTextColor="#71717a"
                value={name}
                onChangeText={setName}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white text-lg"
              />
            </View>
          )}

          <View>
            <Text className="text-zinc-100 font-medium mb-2 ml-1">Email</Text>
            <TextInput
              placeholder="email@example.com"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white text-lg"
            />
          </View>

          <View>
            <Text className="text-zinc-100 font-medium mb-2 ml-1">Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white text-lg"
            />
          </View>
        </View>

        {/* BUTTONS */}
        <View className="mt-10">
          <Pressable
            onPress={handleAuth}
            className="bg-blue-600 p-4 rounded-2xl active:opacity-80"
            disabled={loading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Text>
          </Pressable>

          <Pressable onPress={toggleMode} className="mt-6 py-2">
            <Text className="text-center text-zinc-400 text-base">
              {isLogin ? "New here? " : "Already have an account? "}
              <Text className="text-blue-500 font-bold">
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}