import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import { posthog } from "@/src/config/posthog";
import { supabase } from "@/lib/supabase";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Frequency = "Monthly" | "Yearly";

const CreateSubscriptionModal = ({ visible, onClose }: Props) => {
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // 🔥 Fetch apps
  useEffect(() => {
    const fetchApps = async () => {
      const { data } = await supabase.from("apps").select("*");
      if (data) setApps(data);
    };
    fetchApps();
  }, []);

  const isValidPrice = () => {
    const num = Number(price.trim());
    return Number.isFinite(num) && num > 0;
  };

  const isValidForm = selectedApp && isValidPrice();

  const handleSubmit = async () => {
    if (!isValidForm) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const priceValue = Number(price.trim());
    const now = dayjs();

    const renewalDate =
      frequency === "Monthly"
        ? now.add(1, "month")
        : now.add(1, "year");

    const { error } = await supabase.from("subscriptions").insert([
      {
        user_id: userData.user.id,
        app_id: selectedApp.id,

        // 💰 PRICING
        price: priceValue,
        currency: "INR",
        billing_cycle: frequency.toLowerCase(),

        // 📅 DATES
        start_date: now.toISOString(),
        renewal_date: renewalDate.toISOString(),
        last_charged_date: now.toISOString(),

        // 💳 PAYMENT
        payment_method: paymentMethod,

        // ⚙️ SETTINGS
        auto_renew: true,
        reminder_days_before: 2,

        // 📊 STATUS
        status: "active",
        is_deleted: false,
      },
    ]);

    if (error) {
      console.log("Insert error:", error);
      return;
    }

    posthog.capture("subscription_created", {
      app: selectedApp.name,
      price: priceValue,
      frequency,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPrice("");
    setFrequency("Monthly");
    setSelectedApp(null);
    setPaymentMethod("UPI");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="modal-overlay" onPress={onClose}>
          <Pressable
            className="modal-container"
            onPress={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable onPress={onClose}>
                <Text>✕</Text>
              </Pressable>
            </View>

            <ScrollView className="p-5" contentContainerStyle={{ gap: 20 }}>

              {/* 🔥 APP PICKER */}
              <View>
                <Text>Select App</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {apps.map((app) => (
                    <Pressable
                      key={app.id}
                      onPress={() => setSelectedApp(app)}
                      className={clsx(
                        "mr-3 p-3 rounded-xl border",
                        selectedApp?.id === app.id
                          ? "border-blue-500"
                          : "border-gray-300"
                      )}
                    >
                      <Text>{app.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* 💰 PRICE */}
              <View>
                <Text>Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="Enter price"
                  className="border p-3 rounded"
                />
              </View>

              {/* 🔁 FREQUENCY */}
              <View>
                <Text>Billing Cycle</Text>
                <View className="flex-row gap-5 mt-2">
                  <Pressable onPress={() => setFrequency("Monthly")}>
                    <Text
                      className={clsx(
                        frequency === "Monthly" && "text-blue-500 font-semibold"
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setFrequency("Yearly")}>
                    <Text
                      className={clsx(
                        frequency === "Yearly" && "text-blue-500 font-semibold"
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* 💳 PAYMENT METHOD */}
              <View>
                <Text>Payment Method</Text>
                <View className="flex-row gap-5 mt-2">
                  <Pressable onPress={() => setPaymentMethod("UPI")}>
                    <Text
                      className={clsx(
                        paymentMethod === "UPI" && "text-blue-500 font-semibold"
                      )}
                    >
                      UPI
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => setPaymentMethod("Card")}>
                    <Text
                      className={clsx(
                        paymentMethod === "Card" && "text-blue-500 font-semibold"
                      )}
                    >
                      Card
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* 🚀 SUBMIT BUTTON */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isValidForm}
                className={clsx(
                  "p-3 rounded-xl",
                  isValidForm ? "bg-blue-500" : "bg-gray-400"
                )}
              >
                <Text className="text-white text-center font-semibold">
                  Create Subscription
                </Text>
              </Pressable>

            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;