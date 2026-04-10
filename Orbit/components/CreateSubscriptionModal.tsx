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
    const renewalDate = frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const { error } = await supabase.from("subscriptions").insert([
      {
        user_id: userData.user.id,
        app_id: selectedApp.id,
        price: priceValue,
        currency: "INR",
        billing_cycle: frequency.toLowerCase(),
        start_date: now.toISOString(),
        renewal_date: renewalDate.toISOString(),
        last_charged_date: now.toISOString(),
        payment_method: paymentMethod,
        auto_renew: true,
        reminder_days_before: 2,
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
        className="flex-1 justify-end bg-black/80"
      >
        <Pressable className="absolute inset-0" onPress={onClose} />
        
        {/* MAIN CONTAINER: Pure Black for OLED */}
        <View className="bg-black rounded-t-[40px] p-6 pb-12 border-t border-white/10 shadow-2xl">
          
          {/* DRAG INDICATOR */}
          <View className="w-12 h-1.5 bg-neutral-800 rounded-full self-center mb-8" />

          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-white tracking-tight">Add Subscription</Text>
              <Text className="text-neutral-500 text-sm mt-0.5">Track your recurring expenses</Text>
            </View>
            <Pressable 
              onPress={onClose} 
              className="bg-neutral-900 w-10 h-10 items-center justify-center rounded-full active:bg-neutral-800"
            >
              <Text className="text-neutral-400 font-bold text-lg">✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 28 }}>
            
            {/* APP PICKER */}
            <View>
              <Text className="text-[11px] font-bold text-neutral-500 mb-4 uppercase tracking-[2px]">Select Service</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                {apps.map((app) => (
                  <Pressable
                    key={app.id}
                    onPress={() => setSelectedApp(app)}
                    className={clsx(
                      "mx-2 px-6 py-3.5 rounded-2xl border transition-all",
                      selectedApp?.id === app.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-900/50"
                    )}
                  >
                    <Text className={clsx(
                      "font-semibold text-sm",
                      selectedApp?.id === app.id ? "text-blue-400" : "text-neutral-400"
                    )}>
                      {app.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* PRICE INPUT */}
            <View>
              <Text className="text-[11px] font-bold text-neutral-500 mb-4 uppercase tracking-[2px]">Price (INR)</Text>
              <View className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-5 h-16">
                <Text className="text-xl text-neutral-600 font-medium mr-2">₹</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#404040"
                  className="flex-1 text-xl font-bold text-white"
                  selectionColor="#3b82f6"
                />
              </View>
            </View>

            {/* SEGMENTED CONTROLS */}
            <View className="flex-row gap-5">
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-neutral-500 mb-4 uppercase tracking-[2px]">Billing</Text>
                <View className="flex-row bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                  {["Monthly", "Yearly"].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setFrequency(item as Frequency)}
                      className={clsx(
                        "flex-1 py-2.5 rounded-xl items-center",
                        frequency === item ? "bg-neutral-800 shadow-sm" : "bg-transparent"
                      )}
                    >
                      <Text className={clsx("text-xs font-bold", frequency === item ? "text-blue-400" : "text-neutral-500")}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold text-neutral-500 mb-4 uppercase tracking-[2px]">Method</Text>
                <View className="flex-row bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
                  {["UPI", "Card"].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setPaymentMethod(item)}
                      className={clsx(
                        "flex-1 py-2.5 rounded-xl items-center",
                        paymentMethod === item ? "bg-neutral-800 shadow-sm" : "bg-transparent"
                      )}
                    >
                      <Text className={clsx("text-xs font-bold", paymentMethod === item ? "text-blue-400" : "text-neutral-500")}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValidForm}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              className={clsx(
                "py-5 rounded-2xl mt-4 shadow-xl",
                isValidForm ? "bg-blue-600 shadow-blue-900/40" : "bg-neutral-800 opacity-50"
              )}
            >
              <Text className={clsx(
                "text-center font-black text-base uppercase tracking-widest",
                isValidForm ? "text-white" : "text-neutral-500"
              )}>
                Save Subscription
              </Text>
            </Pressable>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;