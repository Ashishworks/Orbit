import "@/global.css"
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useState, useMemo } from "react";
import { usePostHog } from 'posthog-react-native';
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { router } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const posthog = usePostHog();

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptionStore();

  const displayName = "Guest";

  const upcomingSubscriptions: UpcomingSubscription[] = useMemo(() => {
    const now = dayjs();
    const nextWeek = now.add(7, 'days');

    return subscriptions
      .filter(sub =>
        sub?.status === 'active' &&
        sub?.renewalDate &&
        dayjs(sub.renewalDate).isAfter(now) &&
        dayjs(sub.renewalDate).isBefore(nextWeek)
      )
      .map(sub => ({
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: dayjs(sub.renewalDate!).diff(now, 'day'),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    if (!item?.id) return;

    const isExpanding = expandedSubscriptionId !== item.id;

    setExpandedSubscriptionId((currentId) =>
      currentId === item.id ? null : item.id
    );

    posthog.capture(
      isExpanding ? 'subscription_expanded' : 'subscription_collapsed',
      {
        subscription_name: item.name ?? "unknown",
        subscription_id: item.id,
      }
    );
  };

  const handleCreateSubscription = (newSubscription: Subscription) => {
    addSubscription(newSubscription);

    posthog.capture('subscription_created', {
      subscription_name: newSubscription.name,
      subscription_price: newSubscription.price,
    });
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
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>

            {/* UPCOMING */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Upcoming</Text>
              </View>

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

            {/* ALL SUBSCRIPTIONS + VIEW ALL */}
            <View className="flex-row justify-between items-center mb-2">
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
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}