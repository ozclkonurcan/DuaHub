// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as PurchaseService from "../services/purchaseService";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";

function RootStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        // Enable swipe back gesture
        gestureEnabled: true,
        animation: 'default',
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

export default function RootLayout() {
  useEffect(() => {
    // RevenueCat'i başlat
    PurchaseService.initializePurchases();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </LanguageProvider>
  );
}
