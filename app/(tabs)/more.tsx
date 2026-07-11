import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";

interface Row {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption?: string;
  href?: "/settings/notifications" | "/settings/prayer-method" | "/qibla" | "/dhikr";
  soon?: string;
}

const ROWS: Row[] = [
  {
    icon: "notifications-outline",
    label: "Bildirimler",
    caption: "Vakit bildirimleri ve hatırlatmalar",
    href: "/settings/notifications",
  },
  {
    icon: "time-outline",
    label: "Vakit Hesaplama",
    caption: "Diyanet ve diğer metodlar",
    href: "/settings/prayer-method",
  },
  {
    icon: "compass-outline",
    label: "Kıble Pusulası",
    caption: "Canlı yön ve Kâbe'ye uzaklık",
    href: "/qibla",
  },
  {
    icon: "ellipse-outline",
    label: "Zikirmatik",
    caption: "Hedefli sayaç ve günlük toplamlar",
    href: "/dhikr",
  },
  { icon: "calendar-outline", label: "Takvim & Dini Günler", soon: "Phase 2" },
  { icon: "star-outline", label: "DuaHub Plus", soon: "Phase 2" },
];

export default function MoreScreen() {
  const colors = useThemeColors();

  return (
    <Screen scroll>
      <Text variant="title" className="mb-4 mt-2">
        Daha
      </Text>
      <Card className="p-0">
        {ROWS.map((row, i) => {
          const inner = (
            <View
              className={`flex-row items-center gap-3 px-4 py-4 ${
                i < ROWS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-raised">
                <Ionicons name={row.icon} size={18} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">{row.label}</Text>
                {row.caption ? (
                  <Text variant="caption">{row.caption}</Text>
                ) : null}
              </View>
              {row.soon ? (
                <View className="rounded-full border border-border px-2.5 py-1">
                  <Text variant="caption" className="text-xs font-semibold">
                    {row.soon}
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.muted}
                />
              )}
            </View>
          );

          return row.href ? (
            <Link key={row.label} href={row.href} asChild>
              <Pressable className="active:opacity-70">{inner}</Pressable>
            </Link>
          ) : (
            <View key={row.label} className="opacity-60">
              {inner}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}
