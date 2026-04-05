import { Text, View, Pressable, Image } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from '@/constants/images';
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const posthog = usePostHog();

    // 👇 Static fallback user
    const displayName = "Guest User";
    const email = "guest@example.com";

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

            {/* Optional Button (no auth) */}
            <Pressable
                className="auth-button bg-primary"
                onPress={() => posthog.capture('settings_button_clicked')}
            >
                <Text className="auth-button-text text-white">Continue</Text>
            </Pressable>
        </SafeAreaView>
    )
}

export default Settings