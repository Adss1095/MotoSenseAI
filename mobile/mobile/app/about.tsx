import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../constants/theme";

export default function AboutMotoSenseScreen() {
  const systemScheme = useColorScheme();
  const scheme = systemScheme === "light" ? "light" : "dark";
  const colors = Colors[scheme];

  const insets = useSafeAreaInsets();

  const styles = createStyles(colors, scheme);

  return (
    <View style={styles.container}>
      {/* HEADER */}
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
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          About MotoSense
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        {/* MOTO SENSE INTRO */}

        <View style={styles.heroCard}>
          <View style={styles.logoBox}>
            <Ionicons
              name="shield-checkmark"
              size={40}
              color={colors.cyan}
            />
          </View>

          <Text style={styles.heroTitle}>
            MotoSense AI
          </Text>

          <Text style={styles.heroTagline}>
            Intelligent Safety for Every Ride
          </Text>

          <Text style={styles.heroDescription}>
            MotoSense is an AI-powered two-wheeler safety
            system designed to improve rider awareness,
            detect potential hazards, and provide emergency
            assistance when it matters most.
          </Text>
        </View>

        {/* WHAT MOTOSENSE DOES */}

        <Text style={styles.sectionTitle}>
          WHAT MOTOSENSE DOES
        </Text>

        <View style={styles.card}>
          <FeatureRow
            icon="eye-outline"
            iconColor={colors.cyan}
            iconBackground={
              scheme === "dark"
                ? "rgba(0,229,255,0.10)"
                : "rgba(0,159,194,0.08)"
            }
            title="Blind Spot Detection"
            description="Helps identify vehicles or objects approaching from the rider's blind spots."
            colors={colors}
          />

          <View style={styles.divider} />

          <FeatureRow
            icon="car-outline"
            iconColor={colors.green}
            iconBackground={
              scheme === "dark"
                ? "rgba(0,255,157,0.09)"
                : "rgba(0,168,107,0.07)"
            }
            title="Front Collision Detection"
            description="Provides warnings when a potential collision is detected ahead."
            colors={colors}
          />

          <View style={styles.divider} />

          <FeatureRow
            icon="arrow-down-outline"
            iconColor={colors.cyan}
            iconBackground={
              scheme === "dark"
                ? "rgba(0,229,255,0.10)"
                : "rgba(0,159,194,0.08)"
            }
            title="Rear Collision Detection"
            description="Monitors the rear area of the bike for potential collision risks."
            colors={colors}
          />

          <View style={styles.divider} />

          <FeatureRow
            icon="warning-outline"
            iconColor={colors.red}
            iconBackground={
              scheme === "dark"
                ? "rgba(255,77,77,0.12)"
                : "rgba(217,54,54,0.08)"
            }
            title="Crash Detection"
            description="Detects serious crash events and can initiate the emergency response."
            colors={colors}
          />

          <View style={styles.divider} />

          <FeatureRow
            icon="shield-checkmark-outline"
            iconColor={colors.green}
            iconBackground={
              scheme === "dark"
                ? "rgba(0,255,157,0.09)"
                : "rgba(0,168,107,0.07)"
            }
            title="Emergency SOS"
            description="Can notify the configured emergency contact following a serious incident."
            colors={colors}
          />
        </View>

        {/* SYSTEM INFORMATION */}

        <Text style={styles.sectionTitle}>
          SYSTEM INFORMATION
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="phone-portrait-outline"
            title="Application"
            value="MotoSense AI"
            colors={colors}
            iconColor={colors.cyan}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="hardware-chip-outline"
            title="Safety System"
            value="MotoSense AI Unit"
            colors={colors}
            iconColor={colors.tint}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="bicycle-outline"
            title="Platform"
            value="Two-Wheeler Safety System"
            colors={colors}
            iconColor={colors.green}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="code-slash-outline"
            title="App Version"
            value="1.0.0"
            colors={colors}
            iconColor={colors.tint}
          />
        </View>

        {/* ABOUT PROJECT */}

        <Text style={styles.sectionTitle}>
          ABOUT THE PROJECT
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.cyan}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Built for safer rides
            </Text>

            <Text style={styles.infoText}>
              MotoSense combines intelligent safety features
              with connected hardware and rider-focused
              software to create a safer riding experience.
            </Text>
          </View>
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.green}
          />

          <Text style={styles.footerTitle}>
            MotoSense AI
          </Text>

          <Text style={styles.footerText}>
            Intelligent Safety for Every Ride
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   FEATURE ROW
============================================================ */

type FeatureRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
  colors: typeof Colors.light;
};

function FeatureRow({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  colors,
}: FeatureRowProps) {
  return (
    <View style={stylesBase.featureRow}>
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
          size={21}
          color={iconColor}
        />
      </View>

      <View style={stylesBase.featureContent}>
        <Text
          style={[
            stylesBase.featureTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            stylesBase.featureDescription,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   INFORMATION ROW
============================================================ */

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  colors: typeof Colors.light;
};

function InfoRow({
  icon,
  iconColor,
  title,
  value,
  colors,
}: InfoRowProps) {
  return (
    <View style={stylesBase.infoRow}>
      <View
        style={[
          stylesBase.smallIconBox,
          {
            backgroundColor:
              colors.background === "#FFFFFF"
                ? "rgba(124,58,237,0.08)"
                : "rgba(124,58,237,0.12)",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={stylesBase.infoRowContent}>
        <Text
          style={[
            stylesBase.infoRowTitle,
            {
              color: colors.textMuted,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            stylesBase.infoRowValue,
            {
              color: colors.text,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   BASE STYLES
============================================================ */

const stylesBase = StyleSheet.create({
  featureRow: {
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

  featureContent: {
    flex: 1,
    paddingRight: 5,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },

  featureDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },

  infoRow: {
    minHeight: 65,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 17,
    paddingVertical: 10,
  },

  smallIconBox: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  infoRowContent: {
    flex: 1,
  },

  infoRowTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  infoRowValue: {
    fontSize: 13,
    fontWeight: "600",
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

    /* HEADER */

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

    /* CONTENT */

    content: {
      paddingHorizontal: 18,
      paddingTop: 4,
    },

    /* HERO */

    heroCard: {
      alignItems: "center",

      paddingHorizontal: 22,
      paddingVertical: 24,

      borderRadius: 20,

      backgroundColor: colors.card,

      borderWidth: 1,
      borderColor: colors.border,
    },

    logoBox: {
      width: 70,
      height: 70,

      borderRadius: 20,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        scheme === "dark"
          ? "rgba(0,229,255,0.09)"
          : "rgba(0,159,194,0.08)",

      borderWidth: 1,

      borderColor:
        scheme === "dark"
          ? "rgba(0,229,255,0.15)"
          : "rgba(0,159,194,0.15)",
    },

    heroTitle: {
      color: colors.text,

      fontSize: 22,
      fontWeight: "700",

      marginTop: 13,
    },

    heroTagline: {
      color: colors.tint,

      fontSize: 12.5,
      fontWeight: "600",

      marginTop: 4,
    },

    heroDescription: {
      color: colors.textSecondary,

      fontSize: 11.5,
      lineHeight: 17,

      textAlign: "center",

      marginTop: 13,
    },

    /* SECTION */

    sectionTitle: {
      color: colors.textMuted,

      fontSize: 10.5,
      fontWeight: "700",

      letterSpacing: 1.3,

      marginTop: 19,
      marginBottom: 9,
    },

    /* CARD */

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

    /* PROJECT INFO */

    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",

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

      marginTop: 4,
    },

    /* FOOTER */

    footer: {
      alignItems: "center",

      paddingTop: 25,
      paddingBottom: 5,
    },

    footerTitle: {
      color: colors.text,

      fontSize: 13,
      fontWeight: "700",

      marginTop: 7,
    },

    footerText: {
      color: colors.textMuted,

      fontSize: 10.5,

      marginTop: 3,
    },
  });
}