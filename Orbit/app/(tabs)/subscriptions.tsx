import { Text, View, TextInput, FlatList } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useState, useEffect } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { supabase } from "@/lib/supabase";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // 🔥 FETCH FROM SUPABASE
  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        price,
        currency,
        renewal_date,
        status,
        apps (
          name,
          icon
        )
      `);

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.apps?.name,
        icon: item.apps?.icon, // 🔥 URL
        price: item.price,
        currency: item.currency,
        renewalDate: item.renewal_date,
        status: item.status,
      }));

      setSubscriptions(formatted);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // 🔍 SEARCH FILTER
  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}

        ListHeaderComponent={
          <View className="px-5 pt-5">
            {/* TITLE */}
            <Text className="text-3xl font-bold text-primary mb-5">
              Subscriptions
            </Text>

            {/* 🔍 SEARCH BAR */}
            <View className="flex-row items-center bg-card rounded-2xl px-4 py-3 mb-4 border border-border">
              
              <Text className="mr-2 text-lg">🔍</Text>

              <TextInput
                className="flex-1 text-primary text-base"
                placeholder="Search subscriptions..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                cursorColor="#A78BFA"
              />

              {searchQuery.length > 0 && (
                <Text
                  className="text-sm text-muted-foreground ml-2"
                  onPress={() => setSearchQuery("")}
                >
                  ✕
                </Text>
              )}
            </View>
          </View>
        }

        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          />
        )}

        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          gap: 12,
        }}

        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;