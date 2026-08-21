import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [, setThemeReady] = useState(false);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem("motosense-theme");

        if (savedTheme === "light") {
          Appearance.setColorScheme("light");
        } else if (savedTheme === "dark") {
          Appearance.setColorScheme("dark");
        } else if (savedTheme === "system") {
          Appearance.setColorScheme(null);
        }
      } catch (error) {
        console.log(
          "Failed to load saved theme:",
          error
        );
      } finally {
        setThemeReady(true);
      }
    };

    loadSavedTheme();
  }, []);

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="rider-profile"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="connected-bike"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="emergency-contacts"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="sos-settings"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="alert-details"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="notification-settings"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}