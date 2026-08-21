import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  // =========================================================
  // RESPONSIVE
  // =========================================================

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;

  const contentWidth = Math.min(
    width - (isMobile ? 30 : 60),
    1200
  );

  // =========================================================
  // ANIMATIONS
  // =========================================================

  const fade = useRef(new Animated.Value(0)).current;
  const bikeScale = useRef(new Animated.Value(0.90)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // =========================================================
  // BIKE SIZE
  // =========================================================

  const bikeWidth = isMobile
    ? Math.min(width * 0.92, 390)
    : isTablet
      ? Math.min(width * 0.62, 560)
      : Math.min(contentWidth * 0.54, 680);

  const bikeHeight = bikeWidth * 0.68;

  // =========================================================
  // SPLASH ANIMATION
  // =========================================================

  useEffect(() => {
    const animation = Animated.parallel([
      // Fade everything in
      Animated.timing(fade, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),

      // Gentle motorcycle entrance
      Animated.spring(bikeScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),

      // Loading bar
      Animated.timing(progress, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    // Splash → Dashboard
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3300);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, []);

  // =========================================================
  // LOADING BAR
  // =========================================================

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      Math.min(width * (isMobile ? 0.48 : 0.24), 285),
    ],
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <View style={styles.container}>

      {/* =====================================================
          SUBTLE BACKGROUND
      ===================================================== */}

      <View style={styles.background}>

        <View
          style={[
            styles.backgroundLine,
            {
              top: height * 0.38,
            },
          ]}
        />

        <View
          style={[
            styles.backgroundLine,
            {
              top: height * 0.54,
            },
          ]}
        />

        <View
          style={[
            styles.backgroundLine,
            {
              top: height * 0.72,
            },
          ]}
        />

        {/* Very subtle points */}

        <View
          style={[
            styles.backgroundDot,
            {
              left: "20%",
              top: "42%",
            },
          ]}
        />

        <View
          style={[
            styles.backgroundDot,
            {
              left: "80%",
              top: "42%",
            },
          ]}
        />

        <View
          style={[
            styles.backgroundDot,
            {
              left: "25%",
              top: "70%",
            },
          ]}
        />

        <View
          style={[
            styles.backgroundDot,
            {
              left: "75%",
              top: "70%",
            },
          ]}
        />

      </View>

      {/* =====================================================
          TOP LEFT LABEL
      ===================================================== */}

      <Animated.View
        style={[
          styles.systemLabel,
          {
            top: isMobile ? 22 : 30,
            left: isMobile ? 18 : 30,
            opacity: fade,
          },
        ]}
      >

        <View style={styles.systemDot} />

        <View style={styles.systemLine} />

        <Text
          style={[
            styles.systemText,
            {
              fontSize: isMobile ? 7 : 9,
            },
          ]}
        >
          AI / IoT
        </Text>

      </Animated.View>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Animated.View
        style={[
          styles.header,
          {
            width: contentWidth,

            top: isMobile
              ? height * 0.085
              : height * 0.105,

            opacity: fade,
          },
        ]}
      >

        {/* HELLO, WELCOME TO */}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.welcome,
            {
              fontSize: isMobile
                ? Math.min(width * 0.055, 24)
                : Math.min(width * 0.034, 31),
            },
          ]}
        >
          HELLO, WELCOME TO
        </Text>

        {/* MOTOSENSE AI */}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.logo,
            {
              fontSize: isMobile
                ? Math.min(width * 0.105, 48)
                : Math.min(width * 0.078, 82),
            },
          ]}
        >
          MOTOSENSE
          <Text style={styles.logoAI}> AI</Text>
        </Text>

        {/* SMALL DIVIDER */}

        <View style={styles.divider}>

          <View style={styles.dividerLine} />

          <View style={styles.dividerDot} />

          <View style={styles.dividerLine} />

        </View>

        {/* SUBTITLE */}

        <Text
          numberOfLines={isMobile ? 2 : 1}
          style={[
            styles.subtitle,
            {
              fontSize: isMobile
                ? 11
                : Math.min(width * 0.017, 17),
            },
          ]}
        >
          A Modular AI and IoT Based Rider Assistance System
        </Text>

      </Animated.View>

      {/* =====================================================
          MOTORCYCLE
      ===================================================== */}

      <Animated.View
        style={[
          styles.bikeContainer,
          {
            width: bikeWidth,
            height: bikeHeight,

            left:
              (width - bikeWidth) / 2,

            top: isMobile
              ? height * 0.32
              : height * 0.355,

            opacity: fade,

            transform: [
              {
                scale: bikeScale,
              },
            ],
          },
        ]}
      >

        {/* Soft ground glow */}

        <View style={styles.groundGlow} />

        <Image
          source={require("../assets/images/MotoSense_bike.png")}
          style={styles.bike}
          resizeMode="contain"
        />

      </Animated.View>

      {/* =====================================================
          LOADING
      ===================================================== */}

      <Animated.View
        style={[
          styles.loading,
          {
            bottom: isMobile
              ? height * 0.055
              : height * 0.065,

            opacity: fade,
          },
        ]}
      >

        <View
          style={[
            styles.progressBackground,
            {
              width: Math.min(
                width * (isMobile ? 0.48 : 0.24),
                285
              ),
            },
          ]}
        >

          <Animated.View
            style={[
              styles.progress,
              {
                width: progressWidth,
              },
            ]}
          />

        </View>

        <Text
          style={[
            styles.loadingText,
            {
              fontSize: isMobile ? 9 : 10,
            },
          ]}
        >
          L O A D I N G . . .
        </Text>

      </Animated.View>

    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    flex: 1,
    backgroundColor: "#020912",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // ==========================================================
  // BACKGROUND
  // ==========================================================

  background: {
    ...StyleSheet.absoluteFillObject,
  },

  backgroundLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#071C29",
    opacity: 0.7,
  },

  backgroundDot: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#0A4358",
    opacity: 0.7,
  },

  // ==========================================================
  // TOP LABEL
  // ==========================================================

  systemLabel: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },

  systemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#16BDF2",
  },

  systemLine: {
    width: 24,
    height: 1,
    marginLeft: 6,
    backgroundColor: "#0D5872",
  },

  systemText: {
    marginLeft: 6,
    color: "#496A7A",
    letterSpacing: 2,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },

  welcome: {
    color: "#16BDF2",
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
  },

  logo: {
    marginTop: 4,
    color: "#F5F7FA",
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  logoAI: {
    color: "#16BDF2",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  dividerLine: {
    width: 42,
    height: 1,
    backgroundColor: "#12465B",
  },

  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#16BDF2",
    marginHorizontal: 7,
  },

  subtitle: {
    color: "#9AA9BA",
    textAlign: "center",
    letterSpacing: 0.4,
  },

  // ==========================================================
  // MOTORCYCLE
  // ==========================================================

  bikeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  bike: {
    width: "100%",
    height: "100%",
    zIndex: 3,
  },

  // ==========================================================
  // GROUND GLOW
  // ==========================================================

  groundGlow: {
    position: "absolute",
    width: "62%",
    height: "14%",
    bottom: "11%",
    borderRadius: 100,
    backgroundColor: "#087EA5",
    opacity: 0.30,

    shadowColor: "#16BDF2",
    shadowOpacity: 0.65,
    shadowRadius: 28,

    elevation: 12,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: {
    position: "absolute",
    alignItems: "center",
    zIndex: 20,
  },

  progressBackground: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#102C3D",
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#16BDF2",
  },

  loadingText: {
    marginTop: 13,
    color: "#8FA1B3",
    letterSpacing: 5,
  },

});