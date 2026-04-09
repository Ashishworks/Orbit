import { Text, View, Pressable, Image } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from '@/constants/images';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {


    const { user } = useAuth();

    const displayName = user?.user_metadata?.name || "User";
    const email = user?.email || "";
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log("Logout error:", error.message);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>

            {/* User Profile Section */}
            <View className="auth-card mb-5">
                <View className="flex-row items-center gap-4 mb-4">
                    <Image
                        source={images.avatar}
                        className="size-16 rounded-full"
                    />
                    <View className="flex-1">
                        <Text className="text-lg font-sans-bold text-primary">{displayName}</Text>
                        <Text className="text-sm font-sans-medium text-muted-foreground">{email}</Text>
                    </View>
                </View>
            </View>

            {/* Account Section */}
            <View className="auth-card mb-5">
                <Text className="text-base font-sans-semibold text-primary mb-3">Account</Text>
                <View className="gap-2">
                    <View className="flex-row justify-between items-center py-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground">Account ID</Text>
                        <Text className="text-sm font-sans-medium text-primary">
                            N/A
                        </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground">Joined</Text>
                        <Text className="text-sm font-sans-medium text-primary">
                            N/A
                        </Text>
                    </View>
                </View>
            </View>

            <Pressable
                className="auth-button bg-red-500"
                onPress={handleLogout}
            >
                <Text className="auth-button-text text-white">Logout</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default Settings