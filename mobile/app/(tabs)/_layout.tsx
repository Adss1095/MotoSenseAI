import React from "react";

import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
} from "expo-router/ui";

import { Ionicons } from "@expo/vector-icons";

import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/use-theme-color";

type TabIconName =
  keyof typeof Ionicons.glyphMap;

type CustomTabButtonProps = {
  icon: TabIconName;
  label: string;
  isFocused?: boolean;
};

function CustomTabButton({
  icon,
  label,
  isFocused = false,
}: CustomTabButtonProps) {
  const activeColor = "#7C3AED";

  const inactiveColor = useThemeColor(
    {},
    "tabIconDefault"
  );

  const iconColor = isFocused
    ? activeColor
    : inactiveColor;

  return (
    <View style={styles.tabContent}>
      {/* ICON */}

      <View
        style={[
          styles.iconWrapper,
          isFocused &&
            styles.iconWrapperActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      {/* LABEL */}

      <Text
        style={[
          styles.tabLabel,
          {
            color: iconColor,
          },
          isFocused
            ? styles.tabLabelActive
            : styles.tabLabelInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function TabButton({
  icon,
  label,
  ...props
}: CustomTabButtonProps & any) {
  const isFocused =
    props["aria-selected"] === true ||
    props.accessibilityState?.selected ===
      true;

  return (
    <Pressable
      {...props}
      style={styles.tabButton}
    >
      <CustomTabButton
        icon={icon}
        label={label}
        isFocused={isFocused}
      />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const navBackground = useThemeColor(
    {},
    "navBackground"
  );

  const navBorder = useThemeColor(
    {},
    "navBorder"
  );

  const isWeb = Platform.OS === "web";

  return (
    <Tabs>
      {/* CURRENT SCREEN */}

      <TabSlot />

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION

          Web uses the desktop sidebar instead,
          so the bottom navbar must NOT render on web.
      ===================================================== */}

      {!isWeb && (
        <TabList
          style={[
            styles.tabBar,
            {
              backgroundColor:
                navBackground,

              borderTopColor:
                navBorder,

              paddingBottom: Math.max(
                insets.bottom,
                5
              ),
            },
          ]}
        >
          {/* ================= HOME ================= */}

          <TabTrigger
            name="home"
            href="/"
            asChild
          >
            <TabButton
              icon="home"
              label="Home"
            />
          </TabTrigger>

          {/* ================ DASHBOARD ================ */}

          <TabTrigger
            name="dashboard"
            href="/dashboard"
            asChild
          >
            <TabButton
              icon="stats-chart"
              label="Dashboard"
            />
          </TabTrigger>

          {/* ================= ALERTS ================= */}

          <TabTrigger
            name="alerts"
            href="/alerts"
            asChild
          >
            <TabButton
              icon="notifications"
              label="Alerts"
            />
          </TabTrigger>

          {/* ================= SETTINGS ================= */}

          <TabTrigger
            name="settings"
            href="/settings"
            asChild
          >
            <TabButton
              icon="settings-outline"
              label="Settings"
            />
          </TabTrigger>
        </TabList>
      )}
    </Tabs>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ================= NAVBAR ================= */

  tabBar: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingTop: 3,

    paddingHorizontal: 6,

    borderTopWidth: 1,
  },

  /* ================= TAB BUTTON ================= */

  tabButton: {
    flex: 1,

    height: 54,

    alignItems: "center",

    justifyContent: "center",
  },

  tabContent: {
    width: "100%",

    height: 54,

    alignItems: "center",

    justifyContent: "flex-start",
  },

  /* ================= ICON ================= */

  iconWrapper: {
    width: 36,

    height: 31,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 10,
  },

  iconWrapperActive: {
    backgroundColor:
      "rgba(124, 58, 237, 0.14)",
  },

  /* ================= LABEL ================= */

  tabLabel: {
    fontSize: 10.5,

    marginTop: 2,

    lineHeight: 14,
  },

  tabLabelActive: {
    fontWeight: "700",
  },

  tabLabelInactive: {
    fontWeight: "600",
  },
});