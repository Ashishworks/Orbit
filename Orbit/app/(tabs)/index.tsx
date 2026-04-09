import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { router } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("Guest");

  // 🔥 FETCH EVERYTHING
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
        icon: item.apps?.icon,
        price: item.price,
        currency: item.currency,
        renewalDate: item.renewal_date,
        status: item.status,
      }));

      setSubscriptions(formatted);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchSubscriptions();

    return () => listener.subscription.unsubscribe();
  }, []);

  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");

    return subscriptions
      .filter(
        (sub) =>
          sub?.status === "active" &&
          sub?.renewalDate &&
          dayjs(sub.renewalDate).isAfter(now) &&
          dayjs(sub.renewalDate).isBefore(nextWeek)
      )
      .map((sub) => ({
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate).diff(now, "day"),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const handleSubscriptionPress = (item: any) => {
    setExpandedSubscriptionId((prev) =>
      prev === item.id ? null : item.id
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            {/* HEADER */}
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            {/* BALANCE */}
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            {/* UPCOMING */}
            <View className="mb-5">
              <Text className="text-lg font-bold mb-2">Upcoming</Text>

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* ALL */}
            <View className="flex-row justify-between mb-2">
              <Text className="text-lg font-bold">All Subscriptions</Text>
              <Pressable onPress={() => router.push("/subscriptions")}>
                <Text className="text-primary">View All</Text>
              </Pressable>
            </View>
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />

      {/* 🔥 MODAL */}
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          fetchSubscriptions(); // 🔥 refresh
        }}
      />
    </SafeAreaView>
  );
}