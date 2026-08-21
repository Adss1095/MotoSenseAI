import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import BikeAnalytics from "@/app/bikeanalytics";
import { useThemeColor } from "@/hooks/use-theme-color";
function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === "web" && width >= 900;
  const [showBikeAnalytics, setShowBikeAnalytics] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor({}, "textSecondary");
  const mutedTextColor = useThemeColor({}, "textMuted");
  const cyanColor = useThemeColor({}, "cyan");
  const greenColor = useThemeColor({}, "green");
  const purpleColor = useThemeColor({}, "tint");

  const unreadNotificationCount = 2;

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <StatusBar style="light" />

      {/* ================= HEADER ================= */}
      <View
        style={[
          styles.header,
          isDesktop ? styles.desktopHeader : null,
          {
            height: isDesktop ? 76 : insets.top + 78,
            paddingTop: isDesktop ? 0 : insets.top + 10,
          },
        ]}
      >
        {isDesktop ? (
          <View style={styles.desktopHeaderInner}>
            <View />
            <View style={styles.desktopHeaderRight}>
              <TouchableOpacity
                style={[
                  styles.notificationButton,
                  { backgroundColor: cardColor, borderColor },
                ]}
                activeOpacity={0.75}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={textColor}
                />
                {unreadNotificationCount > 0 && (
                  <View
                    style={[
                      styles.notificationBadge,
                      { backgroundColor: purpleColor, borderColor: cardColor },
                    ]}
                  >
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationCount > 9
                        ? "9+"
                        : unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View
                style={[
                  styles.profilePill,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={17} color="#AAB3C5" />
                </View>
                <View>
                  <Text style={[styles.profileName, { color: textColor }]}>
                    Rider
                  </Text>
                  <Text
                    style={[styles.profileSubtext, { color: mutedTextColor }]}
                  >
                    View Profile
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={mutedTextColor}
                />
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.brandSection}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <Image
                  source={require("@/assets/images/motosense-logo-full.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.brandNameContainer}>
                <Text style={[styles.brandName, { color: textColor }]}>
                  MOTOSENSE
                </Text>
                <Text style={[styles.aiA, { color: purpleColor }]}>A</Text>
                <Text style={[styles.aiI, { color: cyanColor }]}>I</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: cardColor, borderColor },
              ]}
              activeOpacity={0.75}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={textColor}
              />
              {unreadNotificationCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: purpleColor, borderColor: cardColor },
                  ]}
                >
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop
            ? styles.desktopContentContainer
            : styles.mobileContentContainer,
        ]}
        showsVerticalScrollIndicator={isDesktop}
        bounces={!isDesktop}
      >
        <View style={isDesktop ? styles.desktopPage : styles.mobilePage}>
          {/* GREETING */}
          <View style={styles.greeting}>
            <Text style={[styles.greetingTitle, { color: textColor }]}>
              {isDesktop ? `${greeting}, Rider.` : `${greeting}.`}
            </Text>
            <Text
              style={[styles.greetingSubtitle, { color: secondaryTextColor }]}
            >
              Here's how your ride is looking today.
            </Text>
          </View>

          {/* ================= BIKE HERO ================= */}
          {!isDesktop && (
            <View style={styles.mobileBike}>
              <Image
                source={require("@/assets/images/bike.png")}
                style={styles.mobileBikeImage}
                resizeMode="contain"
              />
            </View>
          )}

          {/* ================= DESKTOP HOME GRID ================= */}
          {isDesktop ? (
            <View style={styles.desktopHomeGrid}>
              {/* TOP ROW: SYSTEM STATUS + BIKE */}
              <View style={styles.desktopGridRow}>
                {/* SYSTEM STATUS */}
                {/* SYSTEM STATUS */}
                <View
                  style={[
                    styles.statusCard,
                    styles.desktopGridCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                >
                  <View style={styles.statusIndicatorContainer}>
                    <View style={styles.statusGlow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: greenColor },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text
                      style={[styles.statusLabel, { color: mutedTextColor }]}
                    >
                      SYSTEM STATUS
                    </Text>
                    <Text style={[styles.statusTitle, { color: textColor }]}>
                      ALL SYSTEMS OPERATIONAL
                    </Text>
                    <Text
                      style={[
                        styles.statusDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      Your bike and safety system are functioning normally.
                    </Text>
                  </View>
                </View>

                {/* DESKTOP BIKE */}
                {!showBikeAnalytics && (
                  <View style={styles.desktopBikeHero}>
                    <Image
                      source={require("@/assets/images/bike.png")}
                      style={styles.desktopBikeImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>

              {/* SECOND ROW: TODAY'S RIDE + AI INSIGHT */}
              <View style={styles.desktopGridRow}>
                {/* TODAY'S RIDE */}
                {/* TODAY'S RIDE */}
                <TouchableOpacity
                  style={[
                    styles.rideCard,
                    styles.desktopGridCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardLabel, { color: mutedTextColor }]}>
                      TODAY'S RIDE
                    </Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricBlock}>
                      <View style={styles.metricTopRow}>
                        <View
                          style={[
                            styles.metricIcon,
                            { backgroundColor: "rgba(0,229,255,0.09)" },
                          ]}
                        >
                          <Ionicons
                            name="navigate-outline"
                            size={19}
                            color={cyanColor}
                          />
                        </View>
                        <Text
                          style={[styles.metricValue, { color: textColor }]}
                        >
                          12.4
                        </Text>
                        <Text
                          style={[
                            styles.metricUnit,
                            { color: secondaryTextColor },
                          ]}
                        >
                          km
                        </Text>
                      </View>
                      <Text
                        style={[styles.metricLabel, { color: mutedTextColor }]}
                      >
                        DISTANCE
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricDivider,
                        { backgroundColor: borderColor },
                      ]}
                    />

                    <View style={styles.metricBlock}>
                      <View style={styles.metricTopRow}>
                        <View
                          style={[
                            styles.metricIcon,
                            { backgroundColor: "rgba(124,58,237,0.11)" },
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={19}
                            color={purpleColor}
                          />
                        </View>
                        <Text
                          style={[styles.metricValue, { color: textColor }]}
                        >
                          34
                        </Text>
                        <Text
                          style={[
                            styles.metricUnit,
                            { color: secondaryTextColor },
                          ]}
                        >
                          min
                        </Text>
                      </View>
                      <Text
                        style={[styles.metricLabel, { color: mutedTextColor }]}
                      >
                        RIDE TIME
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.safetySummary,
                      { borderTopColor: borderColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.safetyIcon,
                        { backgroundColor: "rgba(0,255,157,0.08)" },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={17}
                        color={greenColor}
                      />
                    </View>
                    <Text style={[styles.safetyCount, { color: textColor }]}>
                      2
                    </Text>
                    <Text
                      style={[
                        styles.safetyDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      safety events today
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* AI RIDER INSIGHT */}
                {/* ================= AI INSIGHT ================= */}
                <TouchableOpacity
                  style={[
                    styles.aiCard,
                    styles.desktopGridCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[styles.aiAccent, { backgroundColor: purpleColor }]}
                  />
                  <View style={styles.aiInner}>
                    <View style={styles.aiHeader}>
                      <View style={styles.aiTitleSection}>
                        <View
                          style={[
                            styles.aiIcon,
                            { backgroundColor: "rgba(124,58,237,0.11)" },
                          ]}
                        >
                          <Ionicons
                            name="sparkles"
                            size={19}
                            color={purpleColor}
                          />
                        </View>
                        <View>
                          <Text
                            style={[styles.aiLabel, { color: mutedTextColor }]}
                          >
                            AI RIDER INSIGHT
                          </Text>
                          <Text
                            style={[
                              styles.aiTimestamp,
                              { color: mutedTextColor },
                            ]}
                          >
                            JUST NOW
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={[styles.aiMessage, { color: textColor }]}>
                      Smooth riding detected today.
                    </Text>

                    <View
                      style={[styles.aiFooter, { borderTopColor: borderColor }]}
                    >
                      <Text
                        style={[styles.aiSource, { color: mutedTextColor }]}
                      >
                        Based on your riding pattern today
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* ================= MOBILE FIRST ROW ================= */}
              <View style={styles.mobileColumn}>
                {/* SYSTEM STATUS */}
                <View
                  style={[
                    styles.statusCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                >
                  <View style={styles.statusIndicatorContainer}>
                    <View style={styles.statusGlow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: greenColor },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text
                      style={[styles.statusLabel, { color: mutedTextColor }]}
                    >
                      SYSTEM STATUS
                    </Text>
                    <Text style={[styles.statusTitle, { color: textColor }]}>
                      ALL SYSTEMS OPERATIONAL
                    </Text>
                    <Text
                      style={[
                        styles.statusDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      Your bike and safety system are functioning normally.
                    </Text>
                  </View>
                </View>

                {/* TODAY'S RIDE */}
                <TouchableOpacity
                  style={[
                    styles.rideCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardLabel, { color: mutedTextColor }]}>
                      TODAY'S RIDE
                    </Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricBlock}>
                      <View style={styles.metricTopRow}>
                        <View
                          style={[
                            styles.metricIcon,
                            { backgroundColor: "rgba(0,229,255,0.09)" },
                          ]}
                        >
                          <Ionicons
                            name="navigate-outline"
                            size={19}
                            color={cyanColor}
                          />
                        </View>
                        <Text
                          style={[styles.metricValue, { color: textColor }]}
                        >
                          12.4
                        </Text>
                        <Text
                          style={[
                            styles.metricUnit,
                            { color: secondaryTextColor },
                          ]}
                        >
                          km
                        </Text>
                      </View>
                      <Text
                        style={[styles.metricLabel, { color: mutedTextColor }]}
                      >
                        DISTANCE
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricDivider,
                        { backgroundColor: borderColor },
                      ]}
                    />

                    <View style={styles.metricBlock}>
                      <View style={styles.metricTopRow}>
                        <View
                          style={[
                            styles.metricIcon,
                            { backgroundColor: "rgba(124,58,237,0.11)" },
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={19}
                            color={purpleColor}
                          />
                        </View>
                        <Text
                          style={[styles.metricValue, { color: textColor }]}
                        >
                          34
                        </Text>
                        <Text
                          style={[
                            styles.metricUnit,
                            { color: secondaryTextColor },
                          ]}
                        >
                          min
                        </Text>
                      </View>
                      <Text
                        style={[styles.metricLabel, { color: mutedTextColor }]}
                      >
                        RIDE TIME
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.safetySummary,
                      { borderTopColor: borderColor },
                    ]}
                  >
                    <View
                      style={[
                        styles.safetyIcon,
                        { backgroundColor: "rgba(0,255,157,0.08)" },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={17}
                        color={greenColor}
                      />
                    </View>
                    <Text style={[styles.safetyCount, { color: textColor }]}>
                      2
                    </Text>
                    <Text
                      style={[
                        styles.safetyDescription,
                        { color: secondaryTextColor },
                      ]}
                    >
                      safety events today
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* ================= AI INSIGHT ================= */}
              <TouchableOpacity
                style={[
                  styles.aiCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.aiAccent, { backgroundColor: purpleColor }]}
                />
                <View style={styles.aiInner}>
                  <View style={styles.aiHeader}>
                    <View style={styles.aiTitleSection}>
                      <View
                        style={[
                          styles.aiIcon,
                          { backgroundColor: "rgba(124,58,237,0.11)" },
                        ]}
                      >
                        <Ionicons
                          name="sparkles"
                          size={19}
                          color={purpleColor}
                        />
                      </View>
                      <View>
                        <Text
                          style={[styles.aiLabel, { color: mutedTextColor }]}
                        >
                          AI RIDER INSIGHT
                        </Text>
                        <Text
                          style={[
                            styles.aiTimestamp,
                            { color: mutedTextColor },
                          ]}
                        >
                          JUST NOW
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={mutedTextColor}
                    />
                  </View>

                  <Text style={[styles.aiMessage, { color: textColor }]}>
                    Smooth riding detected today.
                  </Text>

                  <View
                    style={[styles.aiFooter, { borderTopColor: borderColor }]}
                  >
                    <Text style={[styles.aiSource, { color: mutedTextColor }]}>
                      Based on your riding pattern today
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color={purpleColor}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ================= BIKE ANALYTICS ================= */}
          <TouchableOpacity
            style={[
              styles.bikeAnalyticsCard,
              { backgroundColor: cardColor, borderColor },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (isDesktop) {
                setShowBikeAnalytics(true);
              } else {
                router.push("/bikeanalytics");
              }
            }}
          >
            <View style={styles.bikeAnalyticsHeader}>
              <View>
                <Text
                  style={[styles.bikeAnalyticsLabel, { color: mutedTextColor }]}
                >
                  BIKE ANALYTICS
                </Text>
                <Text
                  style={[
                    styles.bikeAnalyticsSubtitle,
                    { color: secondaryTextColor },
                  ]}
                >
                  Live bike performance
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={mutedTextColor}
              />
            </View>

            <View style={styles.bikeMetricsRow}>
              <BikeMetric
                icon="water-outline"
                value="65%"
                label="FUEL"
                iconColor={cyanColor}
                iconBg="rgba(0,229,255,0.09)"
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
              <View
                style={[
                  styles.bikeMetricDivider,
                  { backgroundColor: borderColor },
                ]}
              />
              <BikeMetric
                icon="battery-half-outline"
                value="13.2V"
                label="BATTERY"
                iconColor={greenColor}
                iconBg="rgba(0,255,157,0.08)"
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
              <View
                style={[
                  styles.bikeMetricDivider,
                  { backgroundColor: borderColor },
                ]}
              />
              <BikeMetric
                icon="thermometer-outline"
                value="78┬░C"
                label="ENGINE"
                iconColor="#FFB800"
                iconBg="rgba(255,184,0,0.09)"
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
            </View>

            <View
              style={[
                styles.bikeAnalyticsFooter,
                { borderTopColor: borderColor },
              ]}
            >
              <View style={styles.connectionStatus}>
                <View
                  style={[
                    styles.connectionDot,
                    { backgroundColor: greenColor },
                  ]}
                />
                <Text
                  style={[styles.connectionText, { color: secondaryTextColor }]}
                >
                  Bike connected
                </Text>
              </View>
              <Text style={[styles.viewAnalyticsText, { color: purpleColor }]}>
                View analytics ΓåÆ
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= DESKTOP BIKE ANALYTICS DRAWER ================= */}
      {isDesktop && showBikeAnalytics && (
        <View pointerEvents="box-none" style={styles.analyticsDrawerOverlay}>
          {/* DRAWER ONLY ΓÇö no full-screen backdrop.
              The Home screen remains visible and interactive. */}
          <View
            style={[
              styles.analyticsDrawer,
              {
                backgroundColor,
                borderLeftColor: borderColor,
              },
            ]}
          >
            {/* The real Bike Analytics screen already has its own header.
                Keep only a floating close button here to avoid a
                duplicated desktop header. */}
            <TouchableOpacity
              style={[
                styles.analyticsDrawerClose,
                styles.analyticsDrawerCloseFloating,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
              ]}
              activeOpacity={0.75}
              onPress={() => setShowBikeAnalytics(false)}
            >
              <Ionicons name="close" size={21} color={textColor} />
            </TouchableOpacity>

            <View style={styles.analyticsDrawerBody}>
              <BikeAnalytics embedded />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

type BikeMetricProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  iconColor: string;
  iconBg: string;
  textColor: string;
  mutedTextColor: string;
};

function BikeMetric({
  icon,
  value,
  label,
  iconColor,
  iconBg,
  textColor,
  mutedTextColor,
}: BikeMetricProps) {
  return (
    <View style={styles.bikeMetric}>
      <View style={[styles.bikeMetricIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <Text style={[styles.bikeMetricValue, { color: textColor }]}>
        {value}
      </Text>
      <Text style={[styles.bikeMetricLabel, { color: mutedTextColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: 0,
  },

  header: {
    width: "100%",
    minHeight: 78,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  desktopHeader: {
    minHeight: 76,
    paddingTop: 0,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#141C2B",
  },

  desktopHeaderInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  desktopHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  logo: { width: "100%", height: "100%" },

  brandNameContainer: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  brandName: { fontSize: 19, fontWeight: "800", letterSpacing: 0.3 },
  aiA: { fontSize: 19, fontWeight: "900", marginLeft: 4 },
  aiI: { fontSize: 19, fontWeight: "900" },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    top: -4,
    right: -4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  notificationBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

  profilePill: {
    minWidth: 150,
    height: 48,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  profileAvatar: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242C3B",
  },

  profileName: { fontSize: 12, fontWeight: "700" },
  profileSubtext: { fontSize: 9, marginTop: 1 },

  scrollView: {
    flex: 1,
    width: "100%",
    height: "100%",
    minHeight: 0,

    // Important for web scrolling
    overflow: "scroll",
  },
  contentContainer: {
    paddingBottom: 60,
  },

  mobileContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
  },

  desktopContentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 60,
  },

  mobilePage: { width: "100%" },

  desktopPage: {
    width: "100%",
    maxWidth: "100%",
    alignSelf: "stretch",
  },

  greeting: { marginBottom: 18 },
  greetingTitle: { fontSize: 22, fontWeight: "700" },
  greetingSubtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },

  mobileBike: {
    width: "100%",
    height: 270,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
    marginBottom: 4,
    overflow: "hidden",
  },

  mobileBikeImage: {
    width: "100%",
    height: 270,
  },

  desktopTopRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
    width: "100%",
  },

  desktopHomeGrid: {
    width: "100%",
    flexDirection: "column",
    gap: 16,
  },

  desktopGridRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },

  desktopGridCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 174,
    marginTop: 0,
  },

  desktopBikeHero: {
    flex: 1,
    minWidth: 0,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  desktopBikeImage: {
    width: "108%",
    height: "108%",
  },
  mobileColumn: {
    width: "100%",
  },

  statusCard: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
  },

  desktopHalfCard: {
    flex: 1,
    width: "auto",
    minHeight: 174,
  },

  statusIndicatorContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  statusGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,157,0.08)",
  },

  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusTextContainer: { flex: 1 },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  statusDescription: { fontSize: 12, lineHeight: 17 },

  rideCard: {
    width: "100%",
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  metricsRow: { flexDirection: "row", alignItems: "center" },
  metricBlock: { flex: 1 },
  metricTopRow: { flexDirection: "row", alignItems: "center" },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  metricValue: { fontSize: 24, fontWeight: "800" },
  metricUnit: { fontSize: 12, fontWeight: "600", marginLeft: 3 },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 6,
  },
  metricDivider: { width: 1, height: 40, marginHorizontal: 8 },

  safetySummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },

  safetyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  safetyCount: { fontSize: 13, fontWeight: "800", marginRight: 5 },
  safetyDescription: { fontSize: 12 },

  aiCard: {
    width: "100%",
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },

  aiAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  aiInner: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16 },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiTitleSection: { flexDirection: "row", alignItems: "center" },

  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  aiLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  aiTimestamp: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 2,
  },
  aiMessage: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  aiFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
  },
  aiSource: { fontSize: 11, fontWeight: "500" },

  bikeAnalyticsCard: {
    width: "100%",
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },

  bikeAnalyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bikeAnalyticsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  bikeAnalyticsSubtitle: { fontSize: 11, marginTop: 4 },
  bikeMetricsRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  bikeMetric: { flex: 1, alignItems: "center" },
  bikeMetricIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bikeMetricValue: { fontSize: 17, fontWeight: "800" },
  bikeMetricLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginTop: 4,
  },
  bikeMetricDivider: { width: 1, height: 48 },
  bikeAnalyticsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
  },
  connectionStatus: { flexDirection: "row", alignItems: "center" },
  connectionDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  connectionText: { fontSize: 10 },
  viewAnalyticsText: { fontSize: 10, fontWeight: "700" },

  /* =========================================================
     DESKTOP BIKE ANALYTICS DRAWER
     The drawer reuses the existing BikeAnalytics component.
  ========================================================= */

  analyticsDrawerOverlay: {
    position: "absolute",
    top: 73,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,

    // Full-screen container, but the drawer is pushed to the RIGHT.
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },

  analyticsDrawer: {
    width: 560,
    maxWidth: 560,
    flexShrink: 0,
    height: "100%",
    borderLeftWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 24,

    // Keep the drawer itself scrollable/interactive on web.
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "-10px 0px 30px rgba(0,0,0,0.35)",
        } as any)
      : {}),
  },

  analyticsDrawerClose: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  analyticsDrawerCloseFloating: {
    position: "absolute",
    top: 16,
    right: 18,
    zIndex: 20,
  },

  analyticsDrawerBody: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    overflow: "hidden",
  },
});
