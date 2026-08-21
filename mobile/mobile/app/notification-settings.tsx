import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/use-theme-color";

type NotificationSettings = {
  push: boolean;
  sound: boolean;
  vibration: boolean;
};

const STORAGE_KEY = "motosense-notification-settings";

const defaultSettings: NotificationSettings = {
  push: true,
  sound: true,
  vibration: true,
};

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();

  // ================= THEME =================

  const backgroundColor = useThemeColor(
    {},
    "background"
  );

  const cardColor = useThemeColor(
    {},
    "card"
  );

  const borderColor = useThemeColor(
    {},
    "border"
  );

  const textColor = useThemeColor(
    {},
    "text"
  );

  const secondaryTextColor = useThemeColor(
    {},
    "textSecondary"
  );

  const mutedTextColor = useThemeColor(
    {},
    "textMuted"
  );

  const cyanColor = useThemeColor(
    {},
    "cyan"
  );

  const greenColor = useThemeColor(
    {},
    "green"
  );

  const redColor = useThemeColor(
    {},
    "red"
  );

  const purpleColor = useThemeColor(
    {},
    "tint"
  );

  // ================= STATE =================

  const [settings, setSettings] =
    useState<NotificationSettings>(
      defaultSettings
    );

  // ================= LOAD =================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(saved),
        });
      }
    } catch (error) {
      console.log(
        "Failed to load notification settings:",
        error
      );
    }
  };

  // ================= SAVE =================

  const saveSettings = async (
    updated: NotificationSettings
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log(
        "Failed to save notification settings:",
        error
      );
    }
  };

  // ================= TOGGLE =================

  const togglePush = async () => {
    const newPush = !settings.push;

    const updated = {
      ...settings,
      push: newPush,

      // If push notifications are disabled,
      // sound and vibration are disabled too.
      sound: newPush
        ? settings.sound
        : false,

      vibration: newPush
        ? settings.vibration
        : false,
    };

    setSettings(updated);
    await saveSettings(updated);
  };

  const toggleSound = async () => {
    if (!settings.push) return;

    const updated = {
      ...settings,
      sound: !settings.sound,
    };

    setSettings(updated);
    await saveSettings(updated);
  };

  const toggleVibration = async () => {
    if (!settings.push) return;

    const updated = {
      ...settings,
      vibration: !settings.vibration,
    };

    setSettings(updated);
    await saveSettings(updated);
  };

  // ================= UI =================

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor,
        },
      ]}
    >
      <StatusBar style="auto" />

      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          {
            backgroundColor,
            paddingTop: insets.top + 10,
            height: insets.top + 78,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={textColor}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: textColor,
            },
          ]}
        >
          Notifications
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              40 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= GENERAL ================= */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          GENERAL
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          {/* PUSH NOTIFICATIONS */}

          <NotificationToggleRow
            icon="notifications-outline"
            iconColor={cyanColor}
            iconBackground="rgba(0, 229, 255, 0.09)"
            title="Push Notifications"
            description="Receive MotoSense notifications"
            enabled={settings.push}
            disabled={false}
            toggleColor={cyanColor}
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
            borderColor={borderColor}
            onPress={togglePush}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* SOUND */}

          <NotificationToggleRow
            icon="volume-high-outline"
            iconColor={purpleColor}
            iconBackground="rgba(124, 58, 237, 0.11)"
            title="Notification Sound"
            description="Play a sound for important alerts"
            enabled={
              settings.push &&
              settings.sound
            }
            disabled={!settings.push}
            toggleColor={purpleColor}
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
            borderColor={borderColor}
            onPress={toggleSound}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* VIBRATION */}

          <NotificationToggleRow
            icon="phone-portrait-outline"
            iconColor={greenColor}
            iconBackground="rgba(0, 255, 157, 0.08)"
            title="Vibration"
            description="Vibrate for important alerts"
            enabled={
              settings.push &&
              settings.vibration
            }
            disabled={!settings.push}
            toggleColor={greenColor}
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
            borderColor={borderColor}
            onPress={toggleVibration}
          />
        </View>

        {/* ================= ALERT TYPES ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          ALERT TYPES
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          {/* SAFETY ALERTS */}

          <AlertTypeRow
            icon="shield-checkmark-outline"
            iconColor={greenColor}
            iconBackground="rgba(0, 255, 157, 0.08)"
            title="Safety Alerts"
            description="Blind spot and obstacle warnings"
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* SOS */}

          <AlertTypeRow
            icon="alert-circle-outline"
            iconColor={redColor}
            iconBackground="rgba(255, 77, 77, 0.09)"
            title="SOS & Crash Alerts"
            description="Crash detection and emergency alerts"
            secondaryLabel="Always enabled"
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
            accentColor={redColor}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* RIDE UPDATES */}

          <AlertTypeRow
            icon="bicycle-outline"
            iconColor={cyanColor}
            iconBackground="rgba(0, 229, 255, 0.09)"
            title="Ride Updates"
            description="Ride start and tracking updates"
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* SYSTEM UPDATES */}

          <AlertTypeRow
            icon="settings-outline"
            iconColor={purpleColor}
            iconBackground="rgba(124, 58, 237, 0.11)"
            title="System Updates"
            description="System checks and maintenance updates"
            textColor={textColor}
            secondaryTextColor={
              secondaryTextColor
            }
          />
        </View>

        {/* ================= SAFETY PRIORITY ================= */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                "rgba(124, 58, 237, 0.07)",
              borderColor:
                "rgba(124, 58, 237, 0.18)",
            },
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              {
                backgroundColor:
                  "rgba(124, 58, 237, 0.10)",
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={purpleColor}
            />
          </View>

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: textColor,
                },
              ]}
            >
              Safety Priority
            </Text>

            <Text
              style={[
                styles.infoText,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              SOS and crash alerts are
              prioritized for rider safety.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ==================================================
   TOGGLE ROW
================================================== */

function NotificationToggleRow({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  enabled,
  disabled,
  toggleColor,
  textColor,
  secondaryTextColor,
  borderColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
  toggleColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <View
      style={[
        styles.settingRow,
        disabled && styles.disabledRow,
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTitle,
            {
              color: disabled
                ? secondaryTextColor
                : textColor,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.rowDescription,
            {
              color:
                secondaryTextColor,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.toggleTrack,
          {
            backgroundColor: disabled
              ? borderColor
              : enabled
              ? toggleColor
              : "#252B3A",
          },
        ]}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onPress}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              transform: [
                {
                  translateX:
                    enabled && !disabled
                      ? 10
                      : -10,
                },
              ],
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ==================================================
   ALERT TYPE ROW
================================================== */

function AlertTypeRow({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  secondaryLabel,
  accentColor,
  textColor,
  secondaryTextColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  secondaryLabel?: string;
  accentColor?: string;
  textColor: string;
  secondaryTextColor: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTitle,
            {
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.rowDescription,
            {
              color:
                secondaryTextColor,
            },
          ]}
        >
          {description}
        </Text>

        {secondaryLabel && (
          <Text
            style={[
              styles.secondaryLabel,
              {
                color:
                  accentColor ?? "#A78BFA",
              },
            ]}
          >
            {secondaryLabel}
          </Text>
        )}
      </View>

      {/* STATUS */}

      {secondaryLabel ? (
        <View
          style={[
            styles.enabledIndicator,
            {
              backgroundColor:
                accentColor
                  ? `${accentColor}18`
                  : "rgba(124, 58, 237, 0.10)",
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={13}
            color={
              accentColor ?? "#A78BFA"
            }
          />
        </View>
      ) : (
        <View
          style={styles.infoIndicator}
        >
          <Ionicons
            name="chevron-forward"
            size={17}
            color={secondaryTextColor}
          />
        </View>
      )}
    </View>
  );
}

/* ==================================================
   STYLES
================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  /* ================= HEADER ================= */

  header: {
    width: "100%",

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",

    letterSpacing: 0.2,
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  /* ================= CONTENT ================= */

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* ================= SECTIONS ================= */

  sectionLabel: {
    fontSize: 10,

    fontWeight: "800",

    letterSpacing: 1.2,

    marginBottom: 9,
  },

  sectionSpacing: {
    marginTop: 24,
  },

  /* ================= CARD ================= */

  settingsCard: {
    width: "100%",

    borderRadius: 18,

    borderWidth: 1,

    overflow: "hidden",
  },

  /* ================= ROW ================= */

  settingRow: {
    minHeight: 78,

    paddingHorizontal: 15,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
  },

  disabledRow: {
    opacity: 0.52,
  },

  /* ================= ICON ================= */

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  /* ================= TEXT ================= */

  rowText: {
    flex: 1,

    marginRight: 10,
  },

  rowTitle: {
    fontSize: 14,

    fontWeight: "700",

    marginBottom: 4,
  },

  rowDescription: {
    fontSize: 11,

    lineHeight: 16,
  },

  secondaryLabel: {
    fontSize: 9.5,

    fontWeight: "700",

    marginTop: 4,
  },

  /* ================= DIVIDER ================= */

  divider: {
    height: 1,

    marginLeft: 70,
  },

  /* ================= TOGGLE ================= */

  toggleTrack: {
    width: 46,
    height: 27,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  toggleThumb: {
    width: 21,
    height: 21,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    elevation: 2,

    shadowOpacity: 0.18,
    shadowRadius: 2,

    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  /* ================= ALERT STATUS ================= */

  enabledIndicator: {
    width: 27,
    height: 27,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  infoIndicator: {
    width: 27,
    height: 27,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= INFO ================= */

  infoCard: {
    marginTop: 18,

    paddingHorizontal: 12,
    paddingVertical: 11,

    borderRadius: 15,

    borderWidth: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,

    fontWeight: "700",

    marginBottom: 2,
  },

  infoText: {
    fontSize: 10.5,

    lineHeight: 16,
  },
});