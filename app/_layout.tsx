// app/_layout.tsx
import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import * as PurchaseService from "../services/purchaseService";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

function RootStack() {
  const { colors } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeen) {
        // We can't navigate here immediately because root layout mounts before navigation is ready sometimes.
        // Instead, we let the initial route be tabs, but if not seen, we replace.
        // Or simpler: We render a loading screen until we decide.
        // Actually, Expo Router file-based routing handles initial route.
        // We can force redirect in a layout effect.
        setTimeout(() => router.replace('/onboarding'), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
          </View>
      );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        animation: 'default',
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: true, title: "Oops" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    PurchaseService.initializePurchases();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
