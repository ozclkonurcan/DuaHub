import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { DHIKR_PRESETS, getPreset } from "@/features/dhikr/presets";
import { useDhikrStore } from "@/stores/dhikrStore";

const TARGET_OPTIONS = [33, 99, 100, 500];

export default function DhikrScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const store = useDhikrStore();
  const preset = getPreset(store.dhikrKey);
  const progress = Math.min(store.count / store.target, 1);

  const handleTap = () => {
    const setDone = store.tap();
    if (Platform.OS === "web") return;
    if (setDone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Screen>
      {/* Başlık + geri + sıfırla */}
      <View className="mb-3 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text variant="title" className="flex-1">
          Zikirmatik
        </Text>
        <Pressable
          onPress={store.reset}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="refresh" size={18} color={colors.muted} />
        </Pressable>
      </View>

      {/* Zikir seçici */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4 h-10 flex-grow-0"
        contentContainerClassName="items-center gap-2"
      >
        {DHIKR_PRESETS.map((p) => {
          const active = p.key === store.dhikrKey;
          return (
            <Pressable
              key={p.key}
              onPress={() => store.selectDhikr(p.key)}
              className={`h-9 items-center justify-center rounded-full border px-4 active:opacity-70 ${
                active ? "border-primary bg-primary" : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-on-primary" : "text-ink"
                }`}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sayaç — tüm alan dokunmatik */}
      <Pressable
        onPress={handleTap}
        className="flex-1 items-center justify-center rounded-card bg-surface active:bg-raised"
      >
        <Text className="text-2xl text-muted">{preset.arabic}</Text>
        <Text
          className="mt-4 font-mono text-7xl font-bold text-ink"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {store.count}
        </Text>
        <Text variant="caption" className="mt-1">
          hedef {store.target}
          {store.completedSets > 0 ? ` · ${store.completedSets}. set bitti` : ""}
        </Text>

        {/* İlerleme çubuğu */}
        <View className="mt-6 h-2 w-56 overflow-hidden rounded-full bg-raised">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        <Text variant="caption" className="mt-6 opacity-60">
          saymak için ekrana dokun
        </Text>
      </Pressable>

      {/* Hedef + bugünkü toplam */}
      <Card className="mb-1 mt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2">
            {TARGET_OPTIONS.map((t) => {
              const active = store.target === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => store.setTarget(t)}
                  className={`rounded-xl border px-3 py-1.5 active:opacity-70 ${
                    active ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-on-primary" : "text-ink"
                    }`}
                  >
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="items-end">
            <Text variant="label">Bugün</Text>
            <Text className="font-bold text-gold">
              {store.todayTotal(store.dhikrKey)}
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
