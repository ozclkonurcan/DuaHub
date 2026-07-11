import { useColorScheme } from "react-native";

import { palette, type ThemeColors } from "./colors";

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? palette.dark : palette.light;
}
