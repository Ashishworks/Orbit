import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";

import {styled} from "nativewind";
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-xl font-bold text-red-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/subscriptions/[id]">hi</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: {id: "claude"},
      }}
      >claude</Link>
    </SafeAreaView>
   );
}