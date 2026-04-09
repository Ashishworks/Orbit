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
        price: priceValue,
        billing_cycle: frequency.toLowerCase(),
        renewal_date: renewalDate.toISOString(),
        status: "active",
      },
    ]);

    if (error) {
      console.log(error);
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

              {/* PRICE */}
              <View>
                <Text>Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  className="border p-3 rounded"
                />
              </View>

              {/* FREQUENCY */}
              <View>
                <Text>Frequency</Text>
                <View className="flex-row gap-5 mt-2">
                  <Pressable onPress={() => setFrequency("Monthly")}>
                    <Text
                      className={clsx(
                        frequency === "Monthly" && "text-blue-500"
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setFrequency("Yearly")}>
                    <Text
                      className={clsx(
                        frequency === "Yearly" && "text-blue-500"
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* BUTTON */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isValidForm}
                className={clsx(
                  "p-3 rounded",
                  isValidForm ? "bg-blue-500" : "bg-gray-400"
                )}
              >
                <Text className="text-white text-center">
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