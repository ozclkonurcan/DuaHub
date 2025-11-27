// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import * as PurchaseService from "../services/purchaseService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    // RevenueCat'i başlat
    PurchaseService.initializePurchases();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="dua/[id]"
        options={{
          title: "Dua Detayı",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="category/[slug]"
        options={{
          title: "Kategori",
          presentation: "card",
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
