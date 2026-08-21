import React, {
  useMemo,
  useState,
} from "react";

import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Svg, {
  Path,
} from "react-native-svg";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import DashboardMap from "@/components/DashboardMap";

type SensorStatus =
  | "WAITING"
  | "SAFE"
  | "WARNING"
  | "DANGER";

const getStatus = (
  distance: number | null
): SensorStatus => {
  if (distance === null) {
    return "WAITING";
  }

  if (distance <= 1) {
    return "DANGER";
  }

  if (distance <= 3) {
    return "WARNING";
  }

  return "SAFE";
};

const getStatusColor = (
  status: SensorStatus,
  dark: boolean
) => {
  switch (status) {
    case "DANGER":
      return "#FF453A";

    case "WARNING":
      return "#FF9F0A";

    case "SAFE":
      return "#30D158";

    default:
      return dark
        ? "#229BFF"
        : "#0878D1";
  }
};

/* =========================================================
   FRONT RADAR
========================================================= */

function FrontRadar({
  dark,
  compact = false,
}: {
  dark: boolean;
  compact?: boolean;
}) {
  const blue = dark
    ? "#229BFF"
    : "#0878D1";

  return (
    <View
      style={[
        styles.radarContainer,
        compact && styles.compactRadarContainer,
      ]}
    >
      <Svg
        width="100%"
        height={compact ? 58 : 80}
        viewBox="0 0 280 150"
      >
        <Path
          d="M25 120 Q140 5 255 120"
          fill="none"
          stroke={blue}
          strokeWidth="2"
          opacity={0.95}
        />

        <Path
          d="M55 120 Q140 35 225 120"
          fill="none"
          stroke={blue}
          strokeWidth="2"
          opacity={0.75}
        />

        <Path
          d="M88 120 Q140 65 192 120"
          fill="none"
          stroke={blue}
          strokeWidth="2"
          opacity={0.6}
        />
      </Svg>

      <View
        style={[
          styles.radarCenterLine,
          compact && styles.compactRadarCenterLine,
          {
            backgroundColor: `${blue}25`,
          },
        ]}
      />
    </View>
  );
}

/* =========================================================
   REAR RADAR
========================================================= */

function RearRadar({
  dark,
  compact = false,
}: {
  dark: boolean;
  compact?: boolean;
}) {
  const orange = "#FF9F0A";

  return (
    <View
      style={[
        styles.radarContainer,
        compact && styles.compactRadarContainer,
      ]}
    >
      <Svg
        width="100%"
        height={compact ? 58 : 80}
        viewBox="0 0 280 150"
      >
        <Path
          d="M25 30 Q140 145 255 30"
          fill="none"
          stroke={orange}
          strokeWidth="2"
          opacity={0.95}
        />

        <Path
          d="M55 30 Q140 115 225 30"
          fill="none"
          stroke={orange}
          strokeWidth="2"
          opacity={0.75}
        />

        <Path
          d="M88 30 Q140 85 192 30"
          fill="none"
          stroke={orange}
          strokeWidth="2"
          opacity={0.6}
        />
      </Svg>

      <View
        style={[
          styles.radarCenterLine,
          compact && styles.compactRadarCenterLine,
          {
            backgroundColor: `${orange}20`,
          },
        ]}
      />
    </View>
  );
}

/* =========================================================
   SENSOR CARD
========================================================= */

function SensorCard({
  label,
  distance,
  status,
  dark,
  compact = false,
}: {
  label: string;
  distance: number | null;
  status: SensorStatus;
  dark: boolean;
  compact?: boolean;
}) {
  const color = getStatusColor(
    status,
    dark
  );

  return (
    <View
      style={[
        styles.sensorCard,
        compact && styles.compactSensorCard,
        {
          backgroundColor: dark
            ? "#07121F"
            : "#F7FAFE",

          borderColor: `${color}90`,

          shadowColor: color,
        },
      ]}
    >
      <Text
        style={[
          styles.sensorLabel,
          compact && styles.compactSensorLabel,
          {
            color: dark
              ? "#C4D1E1"
              : "#24364D",
          },
        ]}
      >
        {label}
      </Text>

      <View style={styles.distanceRow}>
        <Text
          style={[
            styles.distanceText,
            compact && styles.compactDistanceText,
            {
              color,
            },
          ]}
        >
          {distance === null
            ? "--"
            : distance.toFixed(1)}
        </Text>

        <Text
          style={[
            styles.unitText,
            compact && styles.compactUnitText,
            {
              color: dark
                ? "#A9BBD0"
                : "#52677F",
            },
          ]}
        >
          m
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          compact && styles.compactStatusBadge,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: color,
              position: "absolute",
              right: compact ? 13 : 18,
            },
          ]}
        />

        <Text
          style={[
            styles.statusText,
            compact && styles.compactStatusText,
            {
              color,
            },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   LIVE ALERT CARD
========================================================= */

function AlertCard({
  icon,
  label,
  color,
  dark,
  compact = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  dark: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.alertCard,
        compact && styles.compactAlertCard,
        {
          backgroundColor: dark
            ? "#07121F"
            : "#FFFFFF",

          borderColor: dark
            ? "#18324B"
            : "#D9E3EF",
        },
      ]}
    >
      <View
        style={[
          styles.alertIconCircle,
          compact && styles.compactAlertIconCircle,
          {
            backgroundColor: `${color}12`,
            borderColor: `${color}55`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={compact ? 19 : 22}
          color={color}
        />
      </View>

      <Text
        style={[
          styles.alertLabel,
          compact && styles.compactAlertLabel,
          {
            color: dark
              ? "#E5EDF7"
              : "#24364D",
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.alertIndicator,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

/* =========================================================
   RIGHT STATUS CARD
========================================================= */

function StatusCard({
  icon,
  title,
  value,
  color,
  dark,
  compact = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  color: string;
  dark: boolean;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.statusCard,
        compact && styles.compactStatusCard,
        {
          backgroundColor: dark
            ? "#07121F"
            : "#F7FAFE",

          borderColor: dark
            ? "#18324B"
            : "#D9E3EF",
        },
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          compact && styles.compactStatusIcon,
          {
            backgroundColor: `${color}12`,
            borderColor: `${color}55`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={compact ? 25 : 30}
          color={color}
        />
      </View>

      <View style={styles.statusTextBlock}>
        <Text
          style={[
            styles.statusTitle,
            compact && styles.compactStatusTitle,
            {
              color: dark
                ? "#EAF2FC"
                : "#203247",
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.statusValue,
            compact && styles.compactStatusValue,
            {
              color: dark
                ? "#8FA6BE"
                : "#60758D",
            },
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>

      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const {
    width,
    height,
  } = useWindowDimensions();

  const isDesktop =
    width >= 850;

  /*
   * Short laptop / smaller desktop viewport.
   *
   * This is important because a 1366x768 laptop
   * has much less usable vertical space than
   * a large external monitor.
   */
  const isCompactDesktop =
    isDesktop && height < 850;

  const [darkMode, setDarkMode] =
    useState(true);

  const [
    showNavigation,
    setShowNavigation,
  ] = useState(false);

  /*
   * Temporary sensor values.
   * Keep null until Arduino / Raspberry Pi
   * values are connected.
   */
  const frontDistance:
    | number
    | null = null;

  const rearDistance:
    | number
    | null = null;

  const frontStatus =
    getStatus(frontDistance);

  const rearStatus =
    getStatus(rearDistance);

  const theme = useMemo(
    () => ({
      background: darkMode
        ? "#02060D"
        : "#F4F7FB",

      panel: darkMode
        ? "#050D17"
        : "#FFFFFF",

      panelSecondary: darkMode
        ? "#07121F"
        : "#F7FAFE",

      border: darkMode
        ? "#18314A"
        : "#D7E1EC",

      text: darkMode
        ? "#FFFFFF"
        : "#142235",

      secondaryText: darkMode
        ? "#7B91AD"
        : "#60758D",

      muted: darkMode
        ? "#91A4BD"
        : "#65788D",
    }),
    [darkMode]
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        scrollEnabled={!isDesktop}
        contentContainerStyle={[
          styles.scrollContent,

          isDesktop &&
            styles.desktopContent,

          isCompactDesktop &&
            styles.compactDesktopContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            TOP BAR
        ================================================= */}

        <View
          style={[
            styles.topBar,
            isCompactDesktop &&
              styles.compactTopBar,
          ]}
        >
          <View style={styles.brandRow}>
            <MaterialCommunityIcons
              name="waveform"
              size={isCompactDesktop ? 24 : 27}
              color="#229BFF"
            />

            <Text
              style={[
                styles.brandText,
                isCompactDesktop &&
                  styles.compactBrandText,
                {
                  color: darkMode
                    ? "#9CB3CC"
                    : "#54708D",
                },
              ]}
            >
              MOTOSENSEAI
            </Text>
          </View>

          <View
            style={styles.topActions}
          >
            {/* CAMERA */}

            <Pressable
              style={[
                styles.topIconButton,
                isCompactDesktop &&
                  styles.compactTopIconButton,
                {
                  backgroundColor:
                    darkMode
                      ? "#061323"
                      : "#FFFFFF",

                  borderColor:
                    darkMode
                      ? "#155A91"
                      : "#BFD3E7",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={
                  isCompactDesktop
                    ? 20
                    : 22
                }
                color="#229BFF"
              />
            </Pressable>

            {/* THEME */}

            <Pressable
              onPress={() =>
                setDarkMode(
                  (value) => !value
                )
              }
              style={[
                styles.topIconButton,
                isCompactDesktop &&
                  styles.compactTopIconButton,
                {
                  backgroundColor:
                    darkMode
                      ? "#061323"
                      : "#FFFFFF",

                  borderColor:
                    darkMode
                      ? "#155A91"
                      : "#BFD3E7",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  darkMode
                    ? "white-balance-sunny"
                    : "moon-waning-crescent"
                }
                size={
                  isCompactDesktop
                    ? 19
                    : 21
                }
                color={
                  darkMode
                    ? "#FFD166"
                    : "#315A80"
                }
              />
            </Pressable>
          </View>
        </View>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <View
          style={[
            styles.mainGrid,
            !isDesktop &&
              styles.mobileGrid,
          ]}
        >
          {/* =================================================
              LEFT — LIVE RIDE
          ================================================= */}

          <View
            style={[
              styles.liveRidePanel,
              isCompactDesktop &&
                styles.compactPanel,
              {
                backgroundColor:
                  theme.panel,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.liveHeader,
                isCompactDesktop &&
                  styles.compactLiveHeader,
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.liveTitle,
                    isCompactDesktop &&
                      styles.compactLiveTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Live Ride
                </Text>

                <Text
                  style={[
                    styles.liveSubtitle,
                    isCompactDesktop &&
                      styles.compactLiveSubtitle,
                    {
                      color:
                        theme.secondaryText,
                    },
                  ]}
                >
                  Front & rear proximity
                  monitoring
                </Text>
              </View>

              <View
                style={[
                  styles.liveBadge,
                  isCompactDesktop &&
                    styles.compactLiveBadge,
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    isCompactDesktop &&
                      styles.compactLiveDot,
                  ]}
                />

                <Text
                  style={[
                    styles.liveText,
                    isCompactDesktop &&
                      styles.compactLiveText,
                  ]}
                >
                  LIVE
                </Text>
              </View>
            </View>

            {/* =================================================
                LIVE RIDE CONTENT
            ================================================= */}

            <View
              style={[
                styles.rideContentRow,
                !isDesktop &&
                  styles.mobileRideContentRow,
              ]}
            >
              <View
                style={[
                  styles.rideVisualColumn,
                  isCompactDesktop &&
                    styles.compactRideVisualColumn,
                ]}
              >
                {/* FRONT SENSOR */}

                <SensorCard
                  label="FRONT SENSOR"
                  distance={
                    frontDistance
                  }
                  status={
                    frontStatus
                  }
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                {/* FRONT RADAR */}

                <FrontRadar
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                {/* BIKE */}

                <View
                  style={[
                    styles.bikeArea,
                    isCompactDesktop &&
                      styles.compactBikeArea,
                  ]}
                >
                  <View
                    style={[
                      styles.greenRing,
                      styles.greenOuter,
                      isCompactDesktop &&
                        styles.compactGreenOuter,
                      {
                        borderColor:
                          darkMode
                            ? "#00E67635"
                            : "#00A95745",
                      },
                    ]}
                  />

                  <View
                    style={[
                      styles.greenRing,
                      styles.greenMiddle,
                      isCompactDesktop &&
                        styles.compactGreenMiddle,
                      {
                        borderColor:
                          darkMode
                            ? "#00E67630"
                            : "#00A95738",
                      },
                    ]}
                  />

                  <View
                    style={[
                      styles.greenRing,
                      styles.greenInner,
                      isCompactDesktop &&
                        styles.compactGreenInner,
                      {
                        borderColor:
                          darkMode
                            ? "#00E67628"
                            : "#00A95732",

                        backgroundColor:
                          darkMode
                            ? "#00E67606"
                            : "#00A95704",
                      },
                    ]}
                  />

                  <Image
                    source={require("../../assets/images/bike-live-ride.png")}
                    style={[
                      styles.bikeImage,
                      isCompactDesktop &&
                        styles.compactBikeImage,
                    ]}
                    resizeMode="contain"
                  />
                </View>

                {/* REAR RADAR */}

                <RearRadar
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                {/* REAR SENSOR */}

                <SensorCard
                  label="REAR SENSOR"
                  distance={
                    rearDistance
                  }
                  status={
                    rearStatus
                  }
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />
              </View>

              {/* ALERTS */}

              <View
                style={[
                  styles.alertStack,
                  !isDesktop &&
                    styles.mobileAlertStack,
                ]}
              >
                <AlertCard
                  icon="motorbike"
                  label="Crash Detection"
                  color="#FF453A"
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                <AlertCard
                  icon="motorbike"
                  label="Front Proximity"
                  color="#FF9F0A"
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                <AlertCard
                  icon="motorbike"
                  label="Rear Proximity"
                  color="#FF9F0A"
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />

                <AlertCard
                  icon="alert-circle-outline"
                  label="SOS Emergency Alert"
                  color="#FF453A"
                  dark={darkMode}
                  compact={
                    isCompactDesktop
                  }
                />
              </View>
            </View>
          </View>

          {/* =================================================
              RIGHT — LIVE ALERTS
          ================================================= */}

          <View
            style={[
              styles.alertPanel,
              isCompactDesktop &&
                styles.compactPanel,
              {
                backgroundColor:
                  theme.panel,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.rightHeader,
                isCompactDesktop &&
                  styles.compactRightHeader,
              ]}
            >
              <Text
                style={[
                  styles.alertTitle,
                  isCompactDesktop &&
                    styles.compactAlertTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Live Alerts
              </Text>
            </View>

            {/* =================================================
                STATUS / MAP AREA
            ================================================= */}

            <View
              style={[
                styles.navigationSpace,
                isCompactDesktop &&
                  styles.compactNavigationSpace,
              ]}
            >
              {!showNavigation ? (
                <View
                  style={styles.statusStack}
                >
                  {/* SAFE */}

                  <StatusCard
                    icon="shield-check-outline"
                    title="SAFE"
                    value={
                      frontStatus ===
                        "DANGER" ||
                      rearStatus ===
                        "DANGER"
                        ? "Immediate danger detected"
                        : frontStatus ===
                            "WARNING" ||
                          rearStatus ===
                            "WARNING"
                          ? "Object detected nearby"
                          : "All systems clear"
                    }
                    color="#30D158"
                    dark={darkMode}
                    compact={
                      isCompactDesktop
                    }
                  />

                  {/* RIDE STATUS */}

                  <StatusCard
                    icon="speedometer"
                    title="RIDE STATUS"
                    value="Speed: 0 km/h  •  Idle"
                    color="#229BFF"
                    dark={darkMode}
                    compact={
                      isCompactDesktop
                    }
                  />

                  {/* WEATHER */}

                  <StatusCard
                    icon="weather-partly-cloudy"
                    title="WEATHER STATUS"
                    value="Clear Sky  •  28°C"
                    color="#4D7CFF"
                    dark={darkMode}
                    compact={
                      isCompactDesktop
                    }
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.mapPopup,
                    {
                      backgroundColor:
                        darkMode
                          ? "#071321"
                          : "#F7FAFE",

                      borderColor:
                        darkMode
                          ? "#229BFF55"
                          : "#BFD3E7",
                    },
                  ]}
                >
                  <DashboardMap />

                  <View
                    style={styles.mapLabel}
                  >
                    <MaterialCommunityIcons
                      name="navigation-variant"
                      size={14}
                      color="#229BFF"
                    />

                    <Text
                      style={
                        styles.mapLabelText
                      }
                    >
                      LIVE NAVIGATION
                    </Text>
                  </View>

                  <Pressable
                    style={
                      styles.mapCloseButton
                    }
                    onPress={() =>
                      setShowNavigation(
                        false
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={19}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              )}
            </View>

            {/* =================================================
                BOTTOM CONTROLS
            ================================================= */}

            <View
              style={styles.bottomControls}
            >
              <View
                style={styles.controlRow}
              >
                <Pressable
                  style={[
                    styles.controlButton,
                    isCompactDesktop &&
                      styles.compactControlButton,
                    {
                      backgroundColor:
                        darkMode
                          ? "#061323"
                          : "#F7FAFE",

                      borderColor:
                        darkMode
                          ? "#173A5A"
                          : "#C8D8E8",
                    },

                    showNavigation &&
                      styles.controlButtonActive,
                  ]}
                  onPress={() =>
                    setShowNavigation(
                      true
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="navigation-variant"
                    size={
                      isCompactDesktop
                        ? 19
                        : 21
                    }
                    color="#229BFF"
                  />

                  <Text
                    style={[
                      styles.controlText,
                      isCompactDesktop &&
                        styles.compactControlText,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    Navigation
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.controlButton,
                    isCompactDesktop &&
                      styles.compactControlButton,
                    {
                      backgroundColor:
                        darkMode
                          ? "#061323"
                          : "#F7FAFE",

                      borderColor:
                        darkMode
                          ? "#173A5A"
                          : "#C8D8E8",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={
                      isCompactDesktop
                        ? 20
                        : 22
                    }
                    color="#229BFF"
                  />

                  <Text
                    style={[
                      styles.controlText,
                      isCompactDesktop &&
                        styles.compactControlText,
                      {
                        color:
                          theme.text,
                      },
                    ]}
                  >
                    Camera
                  </Text>
                </Pressable>
              </View>

              {showNavigation && (
                <Pressable
                  style={[
                    styles.closeButton,
                    isCompactDesktop &&
                      styles.compactCloseButton,
                    {
                      backgroundColor:
                        darkMode
                          ? "#13080A"
                          : "#FFF8F8",

                      borderColor:
                        darkMode
                          ? "#FF453A"
                          : "#FF7770",
                    },
                  ]}
                  onPress={() =>
                    setShowNavigation(
                      false
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={
                      isCompactDesktop
                        ? 18
                        : 20
                    }
                    color="#FF453A"
                  />

                  <Text
                    style={[
                      styles.closeText,
                      isCompactDesktop &&
                        styles.compactCloseText,
                    ]}
                  >
                    Close Navigation &
                    Camera
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SCREEN
  ======================================================= */

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    paddingBottom: 35,
  },

  desktopContent: {
    flexGrow: 1,
    minHeight: 0,
  },

  compactDesktopContent: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingBottom: 70,
  },

  /* =======================================================
     TOP BAR
  ======================================================= */

  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  compactTopBar: {
    marginBottom: 10,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandText: {
    marginLeft: 9,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2.2,
  },

  compactBrandText: {
    fontSize: 14,
  },

  topActions: {
    flexDirection: "row",
    gap: 10,
  },

  topIconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  compactTopIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },

  /* =======================================================
     MAIN GRID
  ======================================================= */

  mainGrid: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    gap: 24,
    alignItems: "stretch",
  },

  mobileGrid: {
    flexDirection: "column",
    flex: 0,
  },

  mobileRideContentRow: {
    flexDirection: "column",
    flex: 0,
  },

  /* =======================================================
     PANELS
  ======================================================= */

  liveRidePanel: {
    flex: 1.15,
    minHeight: 0,
    borderRadius: 20,
    borderWidth: 1,
    padding: 26,
    overflow: "hidden",
  },

  alertPanel: {
    flex: 1,
    minHeight: 0,
    borderRadius: 20,
    borderWidth: 1,
    padding: 26,
    overflow: "hidden",
  },

  compactPanel: {
    padding: 18,
  },

  /* =======================================================
     LIVE HEADER
  ======================================================= */

  liveHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  compactLiveHeader: {
    marginBottom: 8,
  },

  liveTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1.4,
  },

  compactLiveTitle: {
    fontSize: 29,
    lineHeight: 32,
  },

  liveSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },

  compactLiveSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  /* =======================================================
     LIVE BADGE
  ======================================================= */

  liveBadge: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#00D87875",
    backgroundColor: "#00D87814",
    flexDirection: "row",
    alignItems: "center",
  },

  compactLiveBadge: {
    height: 34,
    paddingHorizontal: 12,
  },

  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#00E676",
    marginRight: 7,
  },

  compactLiveDot: {
    width: 7,
    height: 7,
    marginRight: 5,
  },

  liveText: {
    color: "#00E676",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },

  compactLiveText: {
    fontSize: 11,
  },

  /* =======================================================
     SENSOR CARD
  ======================================================= */

  sensorCard: {
    width: "62%",
    minWidth: 260,
    height: 130,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },

  compactSensorCard: {
    minWidth: 210,
    height: 86,
    borderRadius: 15,
  },

  sensorLabel: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  compactSensorLabel: {
    fontSize: 14,
    letterSpacing: 1.2,
  },

  distanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },

  distanceText: {
    fontSize: 28,
    fontWeight: "800",
  },

  compactDistanceText: {
    fontSize: 22,
  },

  unitText: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 4,
  },

  compactUnitText: {
    fontSize: 14,
  },

  statusBadge: {
    marginTop: 7,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  compactStatusBadge: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  compactStatusText: {
    fontSize: 9,
  },

  /* =======================================================
     RADAR
  ======================================================= */

  radarContainer: {
    width: "72%",
    maxWidth: 320,
    height: 82,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 3,
  },

  compactRadarContainer: {
    maxWidth: 270,
    height: 54,
    marginVertical: 0,
  },

  radarCenterLine: {
    position: "absolute",
    width: 1,
    height: 65,
    top: 7,
  },

  compactRadarCenterLine: {
    height: 42,
    top: 5,
  },

  /* =======================================================
     BIKE
  ======================================================= */

  bikeArea: {
    width: "100%",
    height: 285,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 2,
  },

  compactBikeArea: {
    height: 190,
    marginVertical: 0,
  },

  bikeImage: {
    width: 175,
    height: 270,
    zIndex: 10,
  },

  compactBikeImage: {
    width: 125,
    height: 190,
  },

  /* =======================================================
     GREEN RINGS
  ======================================================= */

  greenRing: {
    position: "absolute",
    borderRadius: 999,
  },

  greenOuter: {
    width: 265,
    height: 265,
    borderWidth: 1,
  },

  compactGreenOuter: {
    width: 190,
    height: 190,
  },

  greenMiddle: {
    width: 205,
    height: 205,
    borderWidth: 1,
  },

  compactGreenMiddle: {
    width: 150,
    height: 150,
  },

  greenInner: {
    width: 145,
    height: 145,
    borderWidth: 1,
  },

  compactGreenInner: {
    width: 110,
    height: 110,
  },

  /* =======================================================
     RIDE CONTENT
  ======================================================= */

  rideContentRow: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },

  rideVisualColumn: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "space-between",
  },

  compactRideVisualColumn: {
    justifyContent: "space-between",
  },

  /* =======================================================
     ALERT STACK
  ======================================================= */

  alertStack: {
    width: 150,
    alignSelf: "stretch",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  mobileAlertStack: {
    width: "100%",
    flexDirection: "column",
    gap: 10,
    alignSelf: "auto",
  },

  alertCard: {
    width: "100%",
    minHeight: 145,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  compactAlertCard: {
    minHeight: 108,
    borderRadius: 14,
    paddingVertical: 8,
  },

  alertIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  compactAlertIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 7,
  },

  alertLabel: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  compactAlertLabel: {
    fontSize: 11,
    lineHeight: 15,
  },

  alertIndicator: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginTop: 12,
  },

  /* =======================================================
     RIGHT HEADER
  ======================================================= */

  rightHeader: {
    width: "100%",
    marginBottom: 14,
  },

  compactRightHeader: {
    marginBottom: 8,
  },

  alertTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1.2,
  },

  compactAlertTitle: {
    fontSize: 29,
    lineHeight: 32,
  },

  /* =======================================================
     NAVIGATION SPACE
  ======================================================= */

  navigationSpace: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    marginBottom: 14,
    position: "relative",
  },

  compactNavigationSpace: {
    marginBottom: 9,
  },

  statusStack: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    gap: 10,
  },

  /* =======================================================
     STATUS CARD
  ======================================================= */

  statusCard: {
    flex: 1,
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  compactStatusCard: {
    minHeight: 0,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  statusIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  compactStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginBottom: 4,
  },

  statusTextBlock: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  statusTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
  },

  compactStatusTitle: {
    fontSize: 18,
    letterSpacing: 0.5,
  },

  statusValue: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 21,
    textAlign: "center",
  },

  compactStatusValue: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  /* =======================================================
     MAP
  ======================================================= */

  mapPopup: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 12,
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },

  nativeMap: {
    flex: 1,
  },

  webMap: {
    flex: 1,
    backgroundColor: "#071321",
    alignItems: "center",
    justifyContent: "center",
  },

  mapEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  mapEmptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },

  mapEmptyText: {
    color: "#71859A",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  coordinatesText: {
    color: "#229BFF",
    fontSize: 10,
    marginTop: 8,
  },

  mapCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  mapLabel: {
    position: "absolute",
    left: 10,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor:
      "rgba(0,0,0,0.72)",
  },

  mapLabelText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 5,
  },

  /* =======================================================
     BOTTOM CONTROLS
  ======================================================= */

  bottomControls: {
    width: "100%",
    marginTop: "auto",
  },

  controlRow: {
    flexDirection: "row",
    gap: 12,
  },

  controlButton: {
    flex: 1,
    minHeight: 60,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  compactControlButton: {
    minHeight: 48,
    borderRadius: 13,
  },

  controlButtonActive: {
    borderColor: "#229BFF75",
    backgroundColor: "#081A2C",
  },

  controlText: {
    fontSize: 14,
    fontWeight: "700",
  },

  compactControlText: {
    fontSize: 12,
  },

  /* =======================================================
     CLOSE BUTTON
  ======================================================= */

  closeButton: {
    width: "100%",
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  compactCloseButton: {
    minHeight: 48,
    borderRadius: 13,
    marginTop: 8,
  },

  closeText: {
    color: "#FF453A",
    fontSize: 13,
    fontWeight: "800",
  },

  compactCloseText: {
    fontSize: 11,
  },
});