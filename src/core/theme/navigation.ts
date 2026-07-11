import type { Theme } from "@react-navigation/native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

import { palette } from "./colors";

export const navigationThemes: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: palette.light.primary,
      background: palette.light.background,
      card: palette.light.surface,
      text: palette.light.ink,
      border: palette.light.border,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: palette.dark.primary,
      background: palette.dark.background,
      card: palette.dark.surface,
      text: palette.dark.ink,
      border: palette.dark.border,
    },
  },
};
