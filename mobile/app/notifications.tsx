import React, { useEffect, useRef, useState } from "react";

import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColor } from "@/hooks/use-theme-color";

type NotificationType = "critical" | "warning" | "system" | "ride";

type NotificationItem = {
  type: NotificationType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
};

const todayNotifications: NotificationItem[] = [
  {
    type: "critical",
    icon: "alert-circle-outline",
    title: "Crash Detected",
    description: "SOS alert sent to your emergency contacts",
    time: "06:48 PM",
    unread: true,
  },
  {
    type: "warning",
    icon: "eye-outline",
    title: "Blind Spot Warning",
    description: "Vehicle detected in your right blind spot",
    time: "08:42 PM",
    unread: true,
  },
  {
    type: "system",
    icon: "checkmark-circle-outline",
    title: "System Check",
    description: "All systems are operational",
    time: "07:15 PM",
  },
  {
    type: "ride",
    icon: "play-circle-outline",
    title: "Ride Started",
    description: "Ride tracking has been initiated",
    time: "08:02 AM",
  },
];

const yesterdayNotifications: NotificationItem[] = [
  {
    type: "warning",
    icon: "arrow-down-circle-outline",
    title: "Rear Obstacle",
    description: "Obstacle detected behind your bike",
    time: "09:10 PM",
  },
  {
    type: "system",
    icon: "information-circle-outline",
    title: "System Update",
    description: "MotoSense safety system was updated",
    time: "06:30 PM",
  },
];

const notificationColors = {
  critical: {
    primary: "#FF4D4D",
    darkBackground: "rgba(255, 77, 77, 0.10)",
    lightBackground: "rgba(255, 77, 77, 0.10)",
  },

  warning: {
    primary: "#FFB800",
    darkBackground: "rgba(255, 184, 0, 0.10)",
    lightBackground: "rgba(255, 184, 0, 0.12)",
  },

  system: {
    primary: "#00FF9D",
    darkBackground: "rgba(0, 255, 157, 0.10)",
    lightBackground: "rgba(0, 200, 133, 0.10)",
  },

  ride: {
    primary: "#00E5FF",
    darkBackground: "rgba(0, 229, 255, 0.10)",
    lightBackground: "rgba(0, 180, 210, 0.10)",
  },
};

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === "web" && width >= 900;

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    ...todayNotifications,
    ...yesterdayNotifications,
  ]);

  const [hoveredNotification, setHoveredNotification] = useState<string | null>(
    null,
  );

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backgroundColor = useThemeColor({}, "background");

  const cardColor = useThemeColor({}, "card");

  const borderColor = useThemeColor({}, "border");

  const textColor = useThemeColor({}, "text");

  const secondaryTextColor = useThemeColor({}, "textSecondary");

  const mutedTextColor = useThemeColor({}, "textMuted");

  const isDark = backgroundColor === "#0A0F1A";

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  /* =====================================================
     WEB HOVER
  ===================================================== */

  const handleHoverIn = (notification: NotificationItem, index: number) => {
    if (!isDesktop) return;

    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }

    const id = `${notification.title}-${notification.time}-${index}`;

    hoverTimer.current = setTimeout(() => {
      setHoveredNotification(id);
    }, 1000);
  };

  const handleHoverOut = () => {
    if (!isDesktop) return;

    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }

    setHoveredNotification(null);
  };

  /* =====================================================
     MARK ALL
  ===================================================== */

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  /* =====================================================
     MOBILE ONLY
  ===================================================== */

  const openNotification = (notification: NotificationItem) => {
    if (isDesktop) return;

    router.push({
      pathname: "/alert-details",
      params: {
        type: notification.type,
        title: notification.title,
        description: notification.description,
        time: notification.time,
        icon: notification.icon,
      },
    });
  };

  const today = notifications.slice(0, 4);
  const yesterday = notifications.slice(4);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      {/* =====================================================
          SAFE AREA
      ===================================================== */}

      <View
        style={[
          styles.topSafeArea,
          {
            height: insets.top,
            backgroundColor,
          },
        ]}
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <View
          style={[styles.headerInner, isDesktop && styles.desktopHeaderInner]}
        >
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: cardColor,
                borderColor,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={23} color={textColor} />
          </Pressable>

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

          <Pressable
            style={styles.markButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Text
              style={[
                styles.markText,
                {
                  color: unreadCount > 0 ? "#7C3AED" : mutedTextColor,
                },
              ]}
            >
              Mark all
            </Text>
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={isDesktop}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopScrollContent,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        <View
          style={[styles.contentInner, isDesktop && styles.desktopContentInner]}
        >
          {/* SUMMARY */}

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryTitle,
                {
                  color: textColor,
                },
              ]}
            >
              Notifications
            </Text>

            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>

          {/* TODAY */}

          <NotificationSection
            title="Today"
            notifications={today}
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
            isDark={isDark}
            isDesktop={isDesktop}
            onNotificationPress={openNotification}
            hoveredNotification={hoveredNotification}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
          />

          {/* YESTERDAY */}

          <NotificationSection
            title="Yesterday"
            notifications={yesterday}
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
            isDark={isDark}
            isDesktop={isDesktop}
            onNotificationPress={openNotification}
            hoveredNotification={hoveredNotification}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   NOTIFICATION SECTION
========================================================= */

function NotificationSection({
  title,
  notifications,
  cardColor,
  borderColor,
  textColor,
  secondaryTextColor,
  mutedTextColor,
  isDark,
  isDesktop,
  onNotificationPress,
  hoveredNotification,
  onHoverIn,
  onHoverOut,
}: {
  title: string;
  notifications: NotificationItem[];
  cardColor: string;
  borderColor: string;
  textColor: string;
  secondaryTextColor: string;
  mutedTextColor: string;
  isDark: boolean;
  isDesktop: boolean;

  onNotificationPress: (notification: NotificationItem) => void;

  hoveredNotification: string | null;

  onHoverIn: (notification: NotificationItem, index: number) => void;

  onHoverOut: () => void;
}) {
  return (
    <View style={[styles.section, isDesktop && styles.desktopSection]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: textColor,
          },
        ]}
      >
        {title}
      </Text>

      {notifications.map((notification, index) => {
        const colors = notificationColors[notification.type];

        const notificationId = `${notification.title}-${notification.time}-${index}`;

        const isHovered = hoveredNotification === notificationId;

        return (
          <View
            key={notificationId}
            style={[
              styles.notificationWrapper,
              isDesktop && styles.desktopNotificationWrapper,
              isHovered && styles.hoveredNotificationWrapper,
            ]}
          >
            <Pressable
              onPress={() => onNotificationPress(notification)}
              onHoverIn={() => onHoverIn(notification, index)}
              onHoverOut={onHoverOut}
              style={({ pressed }) => [
                styles.notificationCard,
                isDesktop && styles.desktopNotificationCard,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
                notification.unread && styles.unreadCard,
                pressed && styles.notificationPressed,
              ]}
            >
              {/* ICON */}

              <View
                style={[
                  styles.iconContainer,
                  isDesktop && styles.desktopIconContainer,
                  {
                    backgroundColor: isDark
                      ? colors.darkBackground
                      : colors.lightBackground,
                  },
                ]}
              >
                <Ionicons
                  name={notification.icon}
                  size={isDesktop ? 20 : 22}
                  color={colors.primary}
                />
              </View>

              {/* CONTENT */}

              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      isDesktop && styles.desktopNotificationTitle,
                      {
                        color: textColor,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>

                  {notification.unread && <View style={styles.unreadDot} />}
                </View>

                <Text
                  style={[
                    styles.description,
                    isDesktop && styles.desktopDescription,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                  numberOfLines={isDesktop ? 1 : 2}
                >
                  {notification.description}
                </Text>

                <Text
                  style={[
                    styles.time,
                    isDesktop && styles.desktopTime,
                    {
                      color: secondaryTextColor,
                    },
                  ]}
                >
                  {notification.time}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={secondaryTextColor}
              />
            </Pressable>

            {/* WEB HOVER POPUP */}

            {isDesktop && isHovered && (
              <HoverNotificationPopup
                notification={notification}
                colors={colors}
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={textColor}
                secondaryTextColor={secondaryTextColor}
                mutedTextColor={mutedTextColor}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

/* =========================================================
   HOVER POPUP
========================================================= */

function HoverNotificationPopup({
  notification,
  colors,
  cardColor,
  borderColor,
  textColor,
  secondaryTextColor,
  mutedTextColor,
}: {
  notification: NotificationItem;
  colors: {
    primary: string;
    darkBackground: string;
    lightBackground: string;
  };
  cardColor: string;
  borderColor: string;
  textColor: string;
  secondaryTextColor: string;
  mutedTextColor: string;
}) {
  const getLabel = () => {
    switch (notification.type) {
      case "critical":
        return "CRITICAL ALERT";

      case "warning":
        return "SAFETY WARNING";

      case "system":
        return "SYSTEM";

      case "ride":
        return "RIDE UPDATE";

      default:
        return "NOTIFICATION";
    }
  };

  const getStatus = () => {
    switch (notification.type) {
      case "critical":
        return "Action Required";

      case "warning":
        return "Warning Detected";

      case "system":
        return "All Systems Operational";

      case "ride":
        return "Ride Tracking Active";

      default:
        return "Recorded";
    }
  };

  return (
    <View
      pointerEvents="none"
      style={[
        styles.hoverPopup,
        {
          backgroundColor: cardColor,
          borderColor: colors.primary,
        },
      ]}
    >
      {/* POINTER */}

      <View
        style={[
          styles.hoverPointer,
          {
            borderRightColor: colors.primary,
          },
        ]}
      />

      {/* HEADER */}

      <View style={styles.hoverHeader}>
        <View
          style={[
            styles.hoverIcon,
            {
              backgroundColor: colors.darkBackground,
            },
          ]}
        >
          <Ionicons name={notification.icon} size={19} color={colors.primary} />
        </View>

        <View style={styles.hoverHeaderText}>
          <Text
            style={[
              styles.hoverType,
              {
                color: colors.primary,
              },
            ]}
          >
            {getLabel()}
          </Text>

          <Text
            style={[
              styles.hoverTitle,
              {
                color: textColor,
              },
            ]}
          >
            {notification.title}
          </Text>
        </View>
      </View>

      {/* DESCRIPTION */}

      <Text
        style={[
          styles.hoverDescription,
          {
            color: secondaryTextColor,
          },
        ]}
      >
        {notification.description}
      </Text>

      {/* DIVIDER */}

      <View
        style={[
          styles.hoverDivider,
          {
            backgroundColor: borderColor,
          },
        ]}
      />

      {/* STATUS */}

      <View style={styles.hoverRow}>
        <Text
          style={[
            styles.hoverLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          STATUS
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: colors.darkBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              {
                color: colors.primary,
              },
            ]}
          >
            {getStatus()}
          </Text>
        </View>
      </View>

      {/* TIME */}

      <View
        style={[
          styles.hoverRow,
          {
            marginTop: 10,
          },
        ]}
      >
        <Text
          style={[
            styles.hoverLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          TIME
        </Text>

        <Text
          style={[
            styles.hoverValue,
            {
              color: textColor,
            },
          ]}
        >
          {notification.time}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSafeArea: {
    width: "100%",
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 58,
    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  desktopHeader: {
    height: 76,
    paddingHorizontal: 0,
  },

  headerInner: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  desktopHeaderInner: {
    width: "100%",
    maxWidth: 950,
    alignSelf: "center",
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 14,
    borderWidth: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  markButton: {
    width: 62,
    alignItems: "flex-end",
  },

  markText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* =====================================================
     SCROLL
  ===================================================== */

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  desktopScrollContent: {
    paddingHorizontal: 0,
    paddingTop: 18,
  },

  contentInner: {
    width: "100%",
  },

  desktopContentInner: {
    width: "100%",
    maxWidth: 950,
    alignSelf: "center",
  },

  /* =====================================================
     SUMMARY
  ===================================================== */

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 5,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  unreadBadge: {
    marginLeft: 9,

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 10,

    backgroundColor: "rgba(124, 58, 237, 0.12)",
  },

  unreadBadgeText: {
    color: "#7C3AED",

    fontSize: 10,
    fontWeight: "700",
  },

  /* =====================================================
     SECTION
  ===================================================== */

  section: {
    marginTop: 8,
  },

  desktopSection: {
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",

    marginTop: 8,
    marginBottom: 10,
  },

  /* =====================================================
     NOTIFICATION WRAPPER
  ===================================================== */

  notificationWrapper: {
    position: "relative",
    zIndex: 1,
  },

  desktopNotificationWrapper: {
    zIndex: 2,
  },
  hoveredNotificationWrapper: {
    zIndex: 9999,
  },

  /* =====================================================
     NOTIFICATION CARD
  ===================================================== */

  notificationCard: {
    minHeight: 82,

    borderRadius: 17,
    borderWidth: 1,

    marginBottom: 9,

    paddingHorizontal: 13,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
  },

  desktopNotificationCard: {
    minHeight: 88,

    borderRadius: 14,

    marginBottom: 10,

    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  unreadCard: {
    borderColor: "#7C3AED",
  },

  notificationPressed: {
    opacity: 0.72,
  },

  /* =====================================================
     ICON
  ===================================================== */

  iconContainer: {
    width: 46,
    height: 46,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  desktopIconContainer: {
    width: 42,
    height: 42,

    borderRadius: 12,

    marginRight: 13,
  },

  /* =====================================================
     CONTENT
  ===================================================== */

  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 3,
  },

  notificationTitle: {
    fontSize: 14.5,
    fontWeight: "700",

    flexShrink: 1,
  },

  desktopNotificationTitle: {
    fontSize: 14,
  },

  unreadDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#7C3AED",

    marginLeft: 7,
  },

  description: {
    fontSize: 12,
    lineHeight: 17,
  },

  desktopDescription: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  time: {
    fontSize: 10.5,
    marginTop: 4,
  },

  desktopTime: {
    fontSize: 10,
    marginTop: 3,
  },

  /* =====================================================
     HOVER POPUP
  ===================================================== */

  hoverPopup: {
    position: "absolute",

    right: 62,
    top: 7,

    width: 280,

    padding: 16,

    borderRadius: 15,
    borderWidth: 1,

    zIndex: 9999,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.42,
    shadowRadius: 24,

    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0px 12px 32px rgba(0,0,0,0.45)",
        } as any)
      : {}),
  },

  /* =====================================================
     POINTER
  ===================================================== */

  hoverPointer: {
    position: "absolute",

    left: -8,
    top: 28,

    width: 0,
    height: 0,

    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,

    borderTopColor: "transparent",
    borderBottomColor: "transparent",

    borderRightColor: "#7C3AED",
  },

  /* =====================================================
     HOVER HEADER
  ===================================================== */

  hoverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  hoverIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  hoverHeaderText: {
    flex: 1,
  },

  hoverType: {
    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 1,

    marginBottom: 4,
  },

  hoverTitle: {
    fontSize: 15,

    fontWeight: "800",
  },

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  hoverDescription: {
    fontSize: 11.5,

    lineHeight: 17,

    marginTop: 15,
  },

  /* =====================================================
     DIVIDER
  ===================================================== */

  hoverDivider: {
    height: 1,

    width: "100%",

    marginVertical: 13,
  },

  /* =====================================================
     INFO ROW
  ===================================================== */

  hoverRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  hoverLabel: {
    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 0.9,
  },

  hoverValue: {
    fontSize: 10.5,

    fontWeight: "700",

    textAlign: "right",
  },

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  statusBadge: {
    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 6,

    maxWidth: 180,
  },

  statusBadgeText: {
    fontSize: 9.5,

    fontWeight: "800",

    textAlign: "right",
  },
});
