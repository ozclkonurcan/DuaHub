import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { MethodPicker } from "@/features/prayer-times/MethodPicker";

export default function PrayerMethodScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Screen scroll>
      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text variant="title">Vakit Hesaplama</Text>
      </View>

      <MethodPicker />

      <Card className="mt-4 flex-row items-start gap-3">
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.muted}
        />
        <Text variant="caption" className="flex-1 leading-5">
          Metod değişince vakitler ve kurulu bildirimler otomatik güncellenir.
          Türkiye&apos;de yaşıyorsan Diyanet önerilir; yurt dışında bulunduğun
          bölgenin yaygın metodunu seçebilirsin.
        </Text>
      </Card>
    </Screen>
  );
}
