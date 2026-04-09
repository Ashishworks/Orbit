import { View, Text, Image, Pressable } from "react-native";
import React from "react";
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
  icon?: string; // 🔥 now URL
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
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "sub-card",
        expanded ? "sub-card-expanded" : "bg-card"
      )}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      {/* 🔥 HEADER */}
      <View className="sub-head">
        <View className="sub-main">
          
          {/* 🔥 ICON FIXED */}
          <Image
            source={
              icon
                ? { uri: icon }
                : require("@/assets/images/fallback.png") // fallback image
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
                  {(category?.trim() || plan?.trim()) ??
                    "Not provided"}
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
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;