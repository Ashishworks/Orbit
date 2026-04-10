import { View, Text, Image, Pressable } from "react-native";
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

  // ✅ delete handler
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
  onDelete,
}: SubscriptionCardProps) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      {/* 🔥 MAIN CARD */}
      <Pressable
        onPress={onPress}
        className={clsx(
          "sub-card",
          expanded ? "sub-card-expanded" : "bg-card"
        )}
        style={!expanded && color ? { backgroundColor: color } : undefined}
      >
        {/* HEADER */}
        <View className="sub-head">
          <View className="sub-main">
            <Image
              source={
                icon
                  ? { uri: icon }
                  : require("@/assets/images/fallback.png")
              }
              className="sub-icon"
              resizeMode="contain"
            />

            <View className="sub-copy">
              <Text numberOfLines={1} className="sub-title">
                {name}
              </Text>

              <Text numberOfLines={1} className="sub-meta">
                {category?.trim() ||
                  plan?.trim() ||
                  (renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : "")}
              </Text>
            </View>
          </View>

          <View className="sub-price-box">
            <Text className="sub-price">
              {formatCurrency(price, currency)}
            </Text>
            <Text className="sub-billing">{billing}</Text>
          </View>
        </View>

        {/* 🔥 EXPANDED DETAILS */}
        {expanded && (
          <View className="sub-bdy">
            <View className="sub-details">

              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Payment:</Text>
                  <Text className="sub-value">
                    {paymentMethod?.trim() ?? "Not provided"}
                  </Text>
                </View>
              </View>

              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Category:</Text>
                  <Text className="sub-value">
                    {(category?.trim() || plan?.trim()) ?? "Not provided"}
                  </Text>
                </View>
              </View>

              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Started:</Text>
                  <Text className="sub-value">
                    {startDate
                      ? formatSubscriptionDateTime(startDate)
                      : "Not provided"}
                  </Text>
                </View>
              </View>

              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Renewal date:</Text>
                  <Text className="sub-value">
                    {renewalDate
                      ? formatSubscriptionDateTime(renewalDate)
                      : "Not provided"}
                  </Text>
                </View>
              </View>

              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Status:</Text>
                  <Text className="sub-value">
                    {status
                      ? formatStatusLabel(status)
                      : "Not provided"}
                  </Text>
                </View>
              </View>

            </View>

            {/* 🔥 DELETE BUTTON */}
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              className="mt-4 bg-red-500 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Delete Subscription
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* 🔥 CUSTOM DELETE POPUP */}
      {showDeleteModal && (
        <View className="absolute inset-0 justify-center items-center z-50">

          {/* BACKGROUND BLUR */}
          <View className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* POPUP */}
          <View className="w-[85%] bg-card rounded-2xl p-5 shadow-xl">

            <Text className="text-lg font-bold text-center mb-2">
              Delete Subscription
            </Text>

            <Text className="text-center mb-5">
              Are you sure you want to delete this subscription?
            </Text>

            <View className="flex-row gap-3">

              {/* CANCEL */}
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-muted py-3 rounded-xl"
              >
                <Text className="text-center font-semibold">
                  Cancel
                </Text>
              </Pressable>

              {/* DELETE */}
              <Pressable
                onPress={() => {
                  setShowDeleteModal(false);
                  onDelete?.();
                }}
                className="flex-1 bg-red-500 py-3 rounded-xl"
              >
                <Text className="text-white text-center font-semibold">
                  Delete
                </Text>
              </Pressable>

            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default SubscriptionCard;