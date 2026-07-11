import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, Switch, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { buildNotificationPlan } from "@/features/notifications/plan";
import { requestNotificationPermission } from "@/features/notifications/scheduler";
import {
  PRAYER_LABELS,
  type PrayerName,
} from "@/features/prayer-times/engine";
import { useLocationStore } from "@/stores/locationStore";
import {
  useNotificationSettings,
  type PreReminderMinutes,
} from "@/stores/notificationSettings";
import { usePrayerSettings } from "@/stores/prayerSettings";

const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const REMINDER_OPTIONS: { value: PreReminderMinutes; label: string }[] = [
  { value: 0, label: "Kapalı" },
  { value: 15, label: "15 dk" },
  { value: 30, label: "30 dk" },
  { value: 45, label: "45 dk" },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const location = useLocationStore((s) => s.location);
  const method = usePrayerSettings((s) => s.method);
  const settings = useNotificationSettings();

  const plan = buildNotificationPlan(location, settings, { method });

  const handleMasterToggle = async (value: boolean) => {
    if (!value) {
      settings.setMasterEnabled(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted && Platform.OS !== "web") {
      Alert.alert(
        "İzin gerekli",
        "Vakit bildirimleri için sistem ayarlarından bildirim izni vermelisin.",
      );
      return;
    }
    settings.setMasterEnabled(true);
  };

  return (
    <Screen scroll>
      {/* Başlık + geri */}
      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text variant="title">Bildirimler</Text>
      </View>

      {/* Ana anahtar */}
      <Card className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-semibold">Vakit Bildirimleri</Text>
          <Text variant="caption" className="mt-0.5">
            Cihazda kurulur; internet olmasa da çalışır.
          </Text>
        </View>
        <Switch
          value={settings.masterEnabled}
          onValueChange={handleMasterToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {/* Vakit başına anahtarlar */}
      <Text variant="label" className="mb-2 ml-1">
        Vakitler
      </Text>
      <Card className="mb-4 p-0">
        {PRAYER_ORDER.map((prayer, i) => (
          <View
            key={prayer}
            className={`flex-row items-center justify-between px-4 py-3 ${
              i < PRAYER_ORDER.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Text className="font-medium">{PRAYER_LABELS[prayer]}</Text>
            <Switch
              value={settings.prayers[prayer]}
              onValueChange={() => settings.togglePrayer(prayer)}
              disabled={!settings.masterEnabled}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </Card>

      {/* Vakit öncesi hatırlatma */}
      <Text variant="label" className="mb-2 ml-1">
        Vakit Öncesi Hatırlatma
      </Text>
      <Card className="mb-4">
        <View className="flex-row gap-2">
          {REMINDER_OPTIONS.map((option) => {
            const selected = settings.preReminderMinutes === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => settings.setPreReminderMinutes(option.value)}
                disabled={!settings.masterEnabled}
                className={`flex-1 items-center rounded-xl border px-2 py-2.5 active:opacity-70 ${
                  selected ? "border-primary bg-primary" : "border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected ? "text-on-primary" : "text-ink"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Plan özeti */}
      <Card className="flex-row items-start gap-3">
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.muted}
        />
        <View className="flex-1">
          <Text variant="caption" className="leading-5">
            {settings.masterEnabled
              ? `${location.label} için önümüzdeki günlerde ${plan.length} bildirim kurulacak. Konum veya ayar değiştiğinde plan otomatik yenilenir.`
              : "Bildirimler kapalı. Açtığında önümüzdeki 7 günün vakitleri cihazına kurulur."}
            {Platform.OS === "web"
              ? " (Web önizlemede bildirim kurulmaz; plan yalnızca gösterilir.)"
              : ""}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
