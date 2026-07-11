import "../global.css";

import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { navigationThemes } from "@/core/theme/navigation";
import { useNotificationSync } from "@/features/notifications/useNotificationSync";

const queryClient = new QueryClient();

export default function RootLayout() {
  const scheme = useColorScheme() ?? "dark";
  useNotificationSync();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationThemes[scheme]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
