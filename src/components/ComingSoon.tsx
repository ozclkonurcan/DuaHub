import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  phase: string;
  description: string;
  premium?: boolean;
}

export function ComingSoon({ icon, title, phase, description, premium }: Props) {
  const colors = useThemeColors();

  return (
    <Screen className="items-center justify-center">
      <View className="items-center px-6">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-raised">
          <Ionicons name={icon} size={36} color={colors.primary} />
        </View>
        <Text variant="title" className="text-center">
          {title}
        </Text>
        {premium ? (
          <View className="mt-2 rounded-full bg-gold/15 px-3 py-1">
            <Text className="text-xs font-bold text-gold">DuaHub Plus</Text>
          </View>
        ) : null}
        <Text variant="caption" className="mt-3 text-center leading-5">
          {description}
        </Text>
        <View className="mt-5 rounded-full border border-border px-4 py-1.5">
          <Text variant="caption" className="font-semibold">
            {phase}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
