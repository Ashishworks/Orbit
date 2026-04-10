import { View, Text, Image, Pressable, Modal } from "react-native";
import React, { useState } from "react";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import clsx from "clsx";

interface SubscriptionCardProps {
  name: string;
  price: number;
  currency?: string;
  icon?: string;
  billing?: string;
  color?: string;
  category?: string;
  plan?: string;
  renewalDate?: string;
  expanded?: boolean;
  onPress?: () => void;
  paymentMethod?: string;
  startDate?: string;
  status?: string;
  autoRenew?: boolean;
  onDelete?: () => void;
}

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
  autoRenew,
  onDelete,
}: SubscriptionCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Pressable
        onPress={onPress}
        // Shadow-xl and shadow-black/20 create that floating "glass" depth
        className={clsx(
          "mb-4 rounded-[28px] overflow-hidden border border-white/10 shadow-xl shadow-black/20",
          expanded ? "bg-card p-5" : "p-4"
        )}
        style={!expanded && color ? { backgroundColor: color } : { backgroundColor: '#1A1A1A' }}
      >
        {/* HEADER SECTION */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="bg-white/20 p-2 rounded-2xl shadow-sm">
              <Image
                source={icon ? { uri: icon } : require("@/assets/images/fallback.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>

            <View className="ml-4 flex-1">
              <Text numberOfLines={1} className="text-white text-[17px] font-bold tracking-tight">
                {name}
              </Text>
              <Text numberOfLines={1} className="text-white/60 text-xs font-medium uppercase tracking-widest mt-0.5">
                {category?.trim() || plan?.trim() || "Subscription"}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-white text-lg font-black">
              {formatCurrency(price, currency)}
            </Text>
            <Text className="text-white/50 text-[10px] font-bold uppercase">
              {billing ? `per ${billing}` : ""}
            </Text>
          </View>
        </View>

        {/* EXPANDED BODY */}
        {expanded && (
          <View className="mt-6 pt-6 border-t border-white/5">
            <View className="space-y-4">
              <DetailRow label="Payment" value={paymentMethod} />
              <DetailRow label="Billing Cycle" value={billing} />
              <DetailRow 
                label="Started" 
                value={startDate ? formatSubscriptionDateTime(startDate) : null} 
              />
              <DetailRow 
                label="Next Renewal" 
                value={renewalDate ? formatSubscriptionDateTime(renewalDate) : null} 
              />
              {autoRenew !== undefined && (
                <DetailRow label="Auto Renew" value={autoRenew ? "Enabled" : "Disabled"} isStatus />
              )}
              <DetailRow 
                label="Status" 
                value={status ? formatStatusLabel(status) : null} 
                isStatus 
              />
            </View>

            <Pressable
              onPress={() => setShowDeleteModal(true)}
              className="mt-8 bg-red-500/10 border border-red-500/20 py-4 rounded-2xl active:opacity-70"
            >
              <Text className="text-red-500 text-center font-bold tracking-wide">
                Remove Subscription
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* MODAL - Using Modal component for better overlay handling */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="w-full bg-[#1C1C1E] rounded-[32px] p-8 border border-white/10 shadow-2xl">
            <Text className="text-white text-xl font-bold text-center mb-2">
              Delete Subscription?
            </Text>
            <Text className="text-white/60 text-center mb-8 leading-5">
              Are you sure? This will permanently remove {name} from your tracking list.
            </Text>

            <View className="flex-row gap-4">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-white/5 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-semibold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  onDelete?.();
                }}
                className="flex-1 bg-red-600 py-4 rounded-2xl shadow-lg shadow-red-900/40"
              >
                <Text className="text-white text-center font-bold">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Helper component for cleaner code
const DetailRow = ({ label, value, isStatus = false }: { label: string, value?: string | null, isStatus?: boolean }) => (
  <View className="flex-row justify-between items-center mb-3">
    <Text className="text-white/40 text-sm font-medium">{label}</Text>
    <Text className={clsx(
      "text-sm font-semibold",
      isStatus ? "text-emerald-400" : "text-white/90"
    )}>
      {value?.trim() ?? "Not provided"}
    </Text>
  </View>
);

export default SubscriptionCard;