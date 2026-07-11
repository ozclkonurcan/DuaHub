import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Card, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { usePrayerSettings } from "@/stores/prayerSettings";

import {
  CALCULATION_METHODS,
  type CalculationMethodKey,
} from "./engine";

/** Vakit hesaplama metodu seçici — onboarding ve ayarlarda ortak kullanılır. */
export function MethodPicker() {
  const colors = useThemeColors();
  const method = usePrayerSettings((s) => s.method);
  const setMethod = usePrayerSettings((s) => s.setMethod);

  return (
    <Card className="p-0">
      {(
        Object.entries(CALCULATION_METHODS) as [
          CalculationMethodKey,
          (typeof CALCULATION_METHODS)[CalculationMethodKey],
        ][]
      ).map(([key, def], i, arr) => {
        const active = method === key;
        return (
          <Pressable
            key={key}
            onPress={() => setMethod(key)}
            className={`flex-row items-center gap-3 px-4 py-3.5 active:opacity-70 ${
              i < arr.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <View className="flex-1">
              <Text className={active ? "font-bold text-primary" : "font-medium"}>
                {def.label}
              </Text>
              <Text variant="caption" className="text-xs">
                {def.caption}
              </Text>
            </View>
            {active ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
            ) : null}
          </Pressable>
        );
      })}
    </Card>
  );
}
