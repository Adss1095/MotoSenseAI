import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

export default function SOSSettingsScreen() {
  const systemScheme = useColorScheme();
  const scheme = systemScheme === "light" ? "light" : "dark";
  const colors = Colors[scheme];

  const insets = useSafeAreaInsets();

  const [autoCrashResponse, setAutoCrashResponse] = useState(true);
  const [autoSendSOS, setAutoSendSOS] = useState(true);
  const [countdown, setCountdown] = useState(15);

  const styles = useMemo(
    () => createStyles(colors, scheme),
    [colors, scheme]
  );

  const changeCountdown = () => {
    const options = [10, 15, 20, 30];
    const currentIndex = options.indexOf(countdown);
    const nextIndex = (currentIndex + 1) % options.length;

    setCountdown(options[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>SOS Settings</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        {/* ================= SOS PROTECTION ================= */}

        <Text style={styles.sectionTitle}>
          SOS PROTECTION
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={colors.green}
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              SOS Protection Active
            </Text>

            <Text style={styles.statusSubtitle}>
              MotoSense is ready to respond to emergencies.
            </Text>
          </View>

          <View style={styles.activeDot} />
        </View>

        {/* ================= AUTOMATIC RESPONSE ================= */}

        <Text style={styles.sectionTitle}>
          AUTOMATIC RESPONSE
        </Text>

        <View style={styles.card}>
          <SettingRow
            icon="warning-outline"
            iconColor={colors.red}
            iconBackground={
              scheme === "dark"
                ? "rgba(255,77,77,0.12)"
                : "rgba(217,54,54,0.08)"
            }
            title="Automatic Crash Response"
            subtitle="Detect crashes and begin the SOS sequence automatically."
            colors={colors}
            right={
              <Switch
                value={autoCrashResponse}
                onValueChange={setAutoCrashResponse}
                trackColor={{
                  false: colors.border,
                  true: colors.green,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />

          <View style={styles.divider} />

          <Pressable
            style={stylesBase.settingRow}
            onPress={changeCountdown}
          >
            <View
              style={[
                stylesBase.iconBox,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? "rgba(124,58,237,0.14)"
                      : "rgba(124,58,237,0.09)",
                },
              ]}
            >
              <Ionicons
                name="timer-outline"
                size={22}
                color={colors.tint}
              />
            </View>

            <View style={stylesBase.settingContent}>
              <Text style={stylesBase.settingTitle}>
                SOS Countdown
              </Text>

              <Text style={stylesBase.settingSubtitle}>
                Time to cancel a false emergency trigger.
              </Text>
            </View>

            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>
                {countdown}s
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textMuted}
              />
            </View>
          </Pressable>
        </View>

        {/* ================= EMERGENCY CONTACT ================= */}

        <Text style={styles.sectionTitle}>
          EMERGENCY CONTACT
        </Text>

        <View style={styles.card}>
          <Pressable
            style={stylesBase.settingRow}
            onPress={() => router.push("/emergency-contacts")}
          >
            <View
              style={[
                stylesBase.iconBox,
                {
                  backgroundColor:
                    scheme === "dark"
                      ? "rgba(0,229,255,0.10)"
                      : "rgba(0,159,194,0.08)",
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.cyan}
              />
            </View>

            <View style={stylesBase.settingContent}>
              <Text style={stylesBase.settingTitle}>
                Primary Contact
              </Text>

              <Text style={stylesBase.settingSubtitle}>
                Emergency Contact
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {/* ================= RESPONSE BEHAVIOR ================= */}

        <Text style={styles.sectionTitle}>
          RESPONSE BEHAVIOR
        </Text>

        <View style={styles.card}>
          <SettingRow
            icon="send-outline"
            iconColor={colors.tint}
            iconBackground={
              scheme === "dark"
                ? "rgba(124,58,237,0.14)"
                : "rgba(124,58,237,0.09)"
            }
            title="Auto-send SOS"
            subtitle={`Send the emergency alert after the ${countdown}-second countdown.`}
            colors={colors}
            right={
              <Switch
                value={autoSendSOS}
                onValueChange={setAutoSendSOS}
                trackColor={{
                  false: colors.border,
                  true: colors.green,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* ================= LOCATION ================= */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="location-outline"
              size={21}
              color={colors.cyan}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Ride location included automatically
            </Text>

            <Text style={styles.infoText}>
              Your live ride location is managed by MotoSense Maps
              and can be included with an emergency alert.
            </Text>
          </View>
        </View>

        {/* ================= SAFETY NOTE ================= */}

        <View style={styles.safetyCard}>
          <View style={styles.safetyIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={colors.green}
            />
          </View>

          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>
              MotoSense emergency response
            </Text>

            <Text style={styles.safetyText}>
              When a serious crash is detected, MotoSense can begin
              the configured emergency sequence and notify your
              selected contact.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   REUSABLE SETTING ROW
============================================================ */

type SettingRowProps = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  colors: typeof Colors.light;
  right: React.ReactNode;
};

function SettingRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  colors,
  right,
}: SettingRowProps) {
  return (
    <View
      style={[
        stylesBase.settingRow,
        {
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          stylesBase.iconBox,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={stylesBase.settingContent}>
        <Text
          style={[
            stylesBase.settingTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            stylesBase.settingSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      {right}
    </View>
  );
}

/* ============================================================
   REUSABLE BASE STYLES
============================================================ */

const stylesBase = StyleSheet.create({
  settingRow: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 17,
    paddingVertical: 11,
  },

  iconBox: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  settingContent: {
    flex: 1,

    paddingRight: 8,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",

    lineHeight: 18,
  },

  settingSubtitle: {
    fontSize: 11.5,

    lineHeight: 16,

    marginTop: 3,
  },
});

/* ============================================================
   THEMED STYLES
============================================================ */

function createStyles(
  colors: typeof Colors.light,
  scheme: "light" | "dark"
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    /* ================= HEADER ================= */

    header: {
      minHeight: 72,

      paddingHorizontal: 18,
      paddingBottom: 10,

      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 44,
      height: 44,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: colors.card,

      borderWidth: 1,
      borderColor: colors.border,
    },

    headerTitle: {
      flex: 1,

      textAlign: "center",

      marginLeft: -44,
      marginRight: -44,

      color: colors.text,

      fontSize: 20,
      fontWeight: "700",
    },

    headerSpacer: {
      width: 44,
    },

    /* ================= SCROLL ================= */

    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 4,
    },

    /* ================= SECTION ================= */

    sectionTitle: {
      color: colors.textMuted,

      fontSize: 10.5,
      fontWeight: "700",

      letterSpacing: 1.3,

      marginTop: 18,
      marginBottom: 9,
    },

    /* ================= STATUS ================= */

    statusCard: {
      minHeight: 82,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 17,
      paddingVertical: 13,

      borderRadius: 18,

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.06)"
          : "rgba(0,168,107,0.05)",

      borderWidth: 1,

      borderColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.20)"
          : "rgba(0,168,107,0.18)",
    },

    statusIcon: {
      width: 44,
      height: 44,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.09)"
          : "rgba(0,168,107,0.07)",

      marginRight: 13,
    },

    statusContent: {
      flex: 1,

      paddingRight: 8,
    },

    statusTitle: {
      color: colors.text,

      fontSize: 15,
      fontWeight: "700",

      lineHeight: 19,
    },

    statusSubtitle: {
      color: colors.textSecondary,

      fontSize: 11.5,

      lineHeight: 16,

      marginTop: 3,
    },

    activeDot: {
      width: 8,
      height: 8,

      borderRadius: 4,

      backgroundColor: colors.green,
    },

    /* ================= CARD ================= */

    card: {
      overflow: "hidden",

      borderRadius: 18,

      backgroundColor: colors.card,

      borderWidth: 1,
      borderColor: colors.border,
    },

    divider: {
      height: 1,

      marginLeft: 74,

      backgroundColor: colors.border,
    },

    /* ================= COUNTDOWN ================= */

    valueContainer: {
      flexDirection: "row",
      alignItems: "center",

      marginLeft: 5,
    },

    valueText: {
      color: colors.tint,

      fontSize: 13.5,
      fontWeight: "700",

      marginRight: 1,
    },

    /* ================= LOCATION INFO ================= */

    infoCard: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 16,

      padding: 15,

      borderRadius: 17,

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,229,255,0.05)"
          : "rgba(0,159,194,0.05)",

      borderWidth: 1,

      borderColor:
        scheme === "dark"
          ? "rgba(0,229,255,0.15)"
          : "rgba(0,159,194,0.15)",
    },

    infoIcon: {
      width: 42,
      height: 42,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,229,255,0.09)"
          : "rgba(0,159,194,0.07)",

      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      color: colors.text,

      fontSize: 12.5,
      fontWeight: "700",

      lineHeight: 17,
    },

    infoText: {
      color: colors.textSecondary,

      fontSize: 10.5,

      lineHeight: 15,

      marginTop: 3,
    },

    /* ================= SAFETY ================= */

    safetyCard: {
      flexDirection: "row",
      alignItems: "flex-start",

      marginTop: 10,

      padding: 15,

      borderRadius: 17,

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.04)"
          : "rgba(0,168,107,0.04)",

      borderWidth: 1,

      borderColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.13)"
          : "rgba(0,168,107,0.13)",
    },

    safetyIcon: {
      width: 42,
      height: 42,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,255,157,0.08)"
          : "rgba(0,168,107,0.07)",

      marginRight: 12,
    },

    safetyContent: {
      flex: 1,
    },

    safetyTitle: {
      color: colors.text,

      fontSize: 12.5,
      fontWeight: "700",

      lineHeight: 17,
    },

    safetyText: {
      color: colors.textSecondary,

      fontSize: 10.5,

      lineHeight: 15,

      marginTop: 3,
    },
  });
}