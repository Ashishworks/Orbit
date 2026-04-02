import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500">
        Welcome to Nativewind!
      </Text>
      <Link href="/subscriptions/[id]">hi</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: {id: "claude"},
      }}
      >claude</Link>
    </View>
   );
}