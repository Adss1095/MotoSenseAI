import { Appearance, Platform } from "react-native";
import { useEffect, useState } from "react";

type ColorScheme = "light" | "dark";

function getWebScheme(): ColorScheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const saved = window.localStorage.getItem("motosense-theme");

  if (saved === "light") return "light";
  if (saved === "dark") return "dark";

  return window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    if (Platform.OS === "web") {
      return getWebScheme();
    }

    return Appearance.getColorScheme() === "dark"
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      const syncTheme = () => {
        setScheme(getWebScheme());
      };

      window.addEventListener(
        "motosense-theme-change",
        syncTheme
      );

      return () => {
        window.removeEventListener(
          "motosense-theme-change",
          syncTheme
        );
      };
    }

    const subscription = Appearance.addChangeListener(
      ({ colorScheme }) => {
        setScheme(
          colorScheme === "dark"
            ? "dark"
            : "light"
        );
      }
    );

    return () => subscription.remove();
  }, []);

  return scheme;
}