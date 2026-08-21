import { Platform } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Always call the hook first.
  const theme = useColorScheme() ?? "light";

  // Temporary: keep the WEB UI in the existing dark theme.
  // Mobile continues using the normal light/dark theme system.
  const activeTheme =
    Platform.OS === "web"
      ? "dark"
      : theme;

  const colorFromProps = props[activeTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[activeTheme][colorName];
}