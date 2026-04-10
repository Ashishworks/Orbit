import { Text, View, TextInput, FlatList, TouchableOpacity, Platform, UIManager } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useState, useEffect } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { supabase } from "@/lib/supabase";

const SafeAreaView = styled(RNSafeAreaView);
declare global {
  var RN$Fabric: boolean | undefined;
}
// 🔥 FIX: Check if New Architecture is active
const isNewArch = global.RN$Fabric != null;

// Only call this if NOT on the New Architecture
if (!isNewArch && Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // 1. Get User Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  // 2. Fetch Subscriptions Logic
  const fetchSubscriptions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        id, price, currency, billing_cycle, renewal_date, 
        start_date, payment_method, auto_renew, status, is_deleted,
        apps (name, icon)
      `)
      .eq("user_id", user.id)
      .eq("is_deleted", false);

    if (error) {
      console.error("Fetch Error:", error);
      return;
    }

    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.apps?.name,
        icon: item.apps?.icon,
        price: item.price,
        currency: item.currency,
        billing: item.billing_cycle,
        renewalDate: item.renewal_date,
        startDate: item.start_date,
        paymentMethod: item.payment_method,
        autoRenew: item.auto_renew,
        status: item.status,
      }));
      setSubscriptions(formatted);
    }
  };

  useEffect(() => {
    if (user) fetchSubscriptions();
  }, [user]);

  // 3. Search Filter Logic
  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FE] dark:bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        
        ListHeaderComponent={
          <View className="px-6 pt-6 pb-2">
            {/* Header Title & Counter */}
            <View className="flex-row justify-between items-end mb-6">
              <View>
                <Text className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
                  Active Services
                </Text>
                <Text className="text-4xl font-black text-primary tracking-tight">
                  Subscriptions
                </Text>
              </View>
              <View className="bg-primary/10 rounded-full px-3 py-1 mb-1">
                <Text className="text-primary font-bold">{subscriptions.length}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl px-4 py-3.5 mb-4 shadow-sm border border-border/50">
              <Text className="mr-3 text-lg opacity-50">🔍</Text>
              <TextInput
                className="flex-1 text-primary text-base font-medium"
                placeholder="Search your services..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                selectionColor="#A78BFA"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-muted-foreground px-2">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }

        renderItem={({ item }) => (
          <View className="px-6">
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            />
          </View>
        )}

        ListEmptyComponent={
          <View className="items-center justify-center pt-20 px-10">
            <Text className="text-5xl mb-4 opacity-20">💳</Text>
            <Text className="text-xl font-bold text-primary text-center">
              {searchQuery ? "No matches found" : "No subscriptions"}
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              {searchQuery ? "Try a different keyword" : "Add a subscription to see it here."}
            </Text>
          </View>
        }

        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;