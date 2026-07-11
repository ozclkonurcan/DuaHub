import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { useLocationRefresh } from "@/features/location/useLocationRefresh";
import { requestNotificationPermission } from "@/features/notifications/scheduler";
import { MethodPicker } from "@/features/prayer-times/MethodPicker";
import { useAppSettings } from "@/stores/appSettings";
import { useNotificationSettings } from "@/stores/notificationSettings";

type Step = 0 | 1 | 2;

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [step, setStep] = useState<Step>(0);
  const { refresh, busy } = useLocationRefresh();
  const setHasOnboarded = useAppSettings((s) => s.setHasOnboarded);
  const setMasterEnabled = useNotificationSettings((s) => s.setMasterEnabled);

  const finish = () => {
    setHasOnboarded(true);
    router.replace("/");
  };

  const handleLocation = async () => {
    await refresh({ request: true });
    setStep(2);
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) setMasterEnabled(true);
    finish();
  };

  return (
    <Screen>
      {/* İlerleme noktaları */}
      <View className="mt-4 flex-row justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`h-1.5 rounded-full ${
              i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </View>

      {step === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-[28px] bg-primary">
            <Ionicons name="moon" size={44} color={colors.onPrimary} />
          </View>
          <Text variant="display" className="text-center">
            DuaHub
          </Text>
          <Text variant="caption" className="mt-3 text-center text-base leading-6">
            Namaz vakitleri, Kur&apos;an, dua ve zikir — hepsi tek yerde.{"\n"}
            Reklamsız. Çevrimdışı çalışır. Senin ritmine göre.
          </Text>
          <Button
            title="Başlayalım"
            onPress={() => setStep(1)}
            className="mt-8 w-full"
          />
        </View>
      ) : null}

      {step === 1 ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center py-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-raised">
              <Ionicons name="location" size={28} color={colors.primary} />
            </View>
            <Text variant="title" className="text-center">
              Vakitler senin konumuna göre
            </Text>
            <Text variant="caption" className="mt-2 px-4 text-center leading-5">
              Konum yalnızca vakit ve kıble hesabı için cihazında kullanılır;
              hiçbir sunucuya gönderilmez.
            </Text>
          </View>

          <Text variant="label" className="mb-2 ml-1">
            Hesaplama Metodu
          </Text>
          <MethodPicker />

          <Button
            title={busy ? "Konum alınıyor…" : "Konumumu Kullan"}
            onPress={handleLocation}
            disabled={busy}
            className="mt-5"
          />
          <Button
            title="İstanbul ile devam et"
            variant="ghost"
            onPress={() => setStep(2)}
            className="mt-2"
          />
        </ScrollView>
      ) : null}

      {step === 2 ? (
        <View className="flex-1 items-center justify-center px-4">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-raised">
            <Ionicons name="notifications" size={28} color={colors.primary} />
          </View>
          <Text variant="title" className="text-center">
            Hiçbir vakti kaçırma
          </Text>
          <Text variant="caption" className="mt-2 px-4 text-center leading-5">
            Bildirimler cihazına kurulur — internet olmasa da, uygulama kapalı
            olsa da tam vaktinde çalar.
          </Text>
          <Button
            title="Bildirimleri Aç"
            onPress={handleNotifications}
            className="mt-8 w-full"
          />
          <Button
            title="Şimdilik geç"
            variant="ghost"
            onPress={finish}
            className="mt-2 w-full"
          />
        </View>
      ) : null}
    </Screen>
  );
}
