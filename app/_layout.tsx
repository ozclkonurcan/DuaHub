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
        headerBackTitleVisible: false, // Hide the "Back" text (or previous screen title like "(tabs)")
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        animation: 'default',
        // Hide header by default for all screens unless specified,
        // because we are implementing custom headers in most screens to ensure consistency and back button visibility.
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: true, title: "Oops" }} />

      {/* Explicitly define screens if needed, but the default headerShown: false handles most custom screens */}
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
