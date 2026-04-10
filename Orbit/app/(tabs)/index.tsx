import "@/global.css";
import { FlatList, Image, Pressable, Text, View, Dimensions } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
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
const { width } = Dimensions.get("window");

export default function App() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("Guest");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // --- LOGIC (UNTOUCHED) ---
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("name, avatar_url").eq("id", userId).single();
    if (error) return;
    if (data) {
      setDisplayName(data.name || "User");
      setAvatarUrl(data.avatar_url);
    }
  };

  const fetchSubscriptions = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("subscriptions").select(`
        id, price, currency, billing_cycle, renewal_date, start_date, payment_method, status, auto_renew, is_deleted,
        apps ( name, icon )
      `).eq("user_id", user.id).eq("is_deleted", false);

    if (error) return;
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

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase.from("subscriptions").update({ is_deleted: true }).eq("id", id);
    if (!error) fetchSubscriptions();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchSubscriptions();
  }, [user]);

  const upcomingSubscriptions = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, "days");
    return subscriptions
      .filter(sub => sub?.status === "active" && sub?.renewalDate && dayjs(sub.renewalDate).isAfter(now) && dayjs(sub.renewalDate).isBefore(nextWeek))
      .map(sub => ({
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
    setExpandedSubscriptionId((prev) => prev === item.id ? null : item.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]"> {/* Deep Slate Background */}
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <View className="p-6">
            {/* HEADER */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-slate-400 text-sm font-medium uppercase tracking-widest">{greeting}</Text>
                <Text className="text-white text-2xl font-bold">{displayName}</Text>
              </View>
              <Pressable
                onPress={() => setIsModalVisible(true)}
                className="bg-[#6366F1] p-3 rounded-2xl shadow-lg shadow-indigo-500/50"
              >
                <Image source={icons.add} className="w-6 h-6 tint-white" style={{ tintColor: 'white' }} />
              </Pressable>
            </View>

            {/* MODERN BALANCE CARD */}
            <View className="bg-[#1E293B] rounded-[32px] p-6 mb-8 border border-slate-700/50 overflow-hidden">
              {/* Decorative background element */}
              <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#6366F1] opacity-10 rounded-full" />

              <Text className="text-slate-400 font-medium mb-1">Total Monthly Spend</Text>
              <View className="flex-row items-baseline">
                <Text className="text-white text-4xl font-bold">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <View className="ml-3 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <Text className="text-emerald-400 text-xs font-bold">Active</Text>
                </View>
              </View>

              <View className="h-[1px] bg-slate-700/50 my-4" />

              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 text-xs">Next billing cycle</Text>
                <Text className="text-slate-300 font-semibold">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMMM DD")}
                </Text>
              </View>
            </View>

            {/* UPCOMING SECTION */}
            <View className="mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <Text className="text-white text-xl font-bold">Upcoming</Text>
                <Text className="text-indigo-400 text-xs font-bold tracking-tighter">NEXT 7 DAYS</Text>
              </View>

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <View className="mr-4 shadow-sm">
                    <UpcomingSubscriptionCard {...item} />
                  </View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* LIST HEADER */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">My Subscriptions</Text>
              <Pressable onPress={() => router.push("/subscriptions")}>
                <Text className="text-slate-400 font-medium">View All</Text>
              </Pressable>
            </View>
          </View>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => handleSubscriptionPress(item)}
              onDelete={() => deleteSubscription(item.id)}
            />
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View className="h-4" />
        )}
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          fetchSubscriptions();
        }}
      />
    </SafeAreaView>
  );
}