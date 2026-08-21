import React, { useEffect, useState } from "react";
import {
  Appearance,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

type ThemeMode = "auto" | "light" | "dark";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const [appearanceVisible, setAppearanceVisible] =
    useState(false);

  const [themeMode, setThemeMode] =
    useState<ThemeMode>("auto");

  // ================= THEME COLORS =================

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");

  const textColor = useThemeColor({}, "text");
  const secondaryTextColor = useThemeColor(
    {},
    "textSecondary"
  );
  const mutedTextColor = useThemeColor(
    {},
    "textMuted"
  );

  const cyanColor = useThemeColor({}, "cyan");
  const greenColor = useThemeColor({}, "green");
  const redColor = useThemeColor({}, "red");
  const purpleColor = useThemeColor({}, "tint");

  // ================= LOAD SAVED THEME =================

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem(
            "motosense-theme"
          );

        if (savedTheme === "light") {
          setThemeMode("light");
        } else if (savedTheme === "dark") {
          setThemeMode("dark");
        } else {
          setThemeMode("auto");
        }
      } catch (error) {
        console.log(
          "Failed to load saved theme:",
          error
        );
      }
    };

    loadTheme();
  }, []);

  // ================= CHANGE THEME =================

  const changeTheme = async (
    mode: ThemeMode
  ) => {
    try {
      setThemeMode(mode);

      if (mode === "auto") {
        Appearance.setColorScheme(null);

        await AsyncStorage.setItem(
          "motosense-theme",
          "system"
        );
      }

      if (mode === "light") {
        Appearance.setColorScheme("light");

        await AsyncStorage.setItem(
          "motosense-theme",
          "light"
        );
      }

      if (mode === "dark") {
        Appearance.setColorScheme("dark");

        await AsyncStorage.setItem(
          "motosense-theme",
          "dark"
        );
      }

      // On web, Appearance.setColorScheme() does not
      // reliably notify every screen. The Settings screen
      // itself already updates through themeMode, so notify
      // the rest of the web app without changing routing.
      if (Platform.OS === "web") {
        window.localStorage.setItem(
          "motosense-theme",
          mode === "auto" ? "system" : mode
        );

        window.dispatchEvent(
          new Event("motosense-theme-change")
        );
      }

      setAppearanceVisible(false);
    } catch (error) {
      console.log(
        "Failed to change theme:",
        error
      );
    }
  };

  // ================= CURRENT MODE =================

  const currentDisplayMode =
    colorScheme === "dark"
      ? "Night Mode"
      : "Day Mode";

  // ================= AUTO TOGGLE =================

  const toggleAutoAdapt = () => {
    if (themeMode === "auto") {
      // Turn Auto Adapt OFF
      // Keep the currently displayed mode

      if (colorScheme === "dark") {
        changeTheme("dark");
      } else {
        changeTheme("light");
      }
    } else {
      // Turn Auto Adapt ON
      changeTheme("auto");
    }
  };

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
          Settings
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
              Platform.OS === "web"
                ? 40
                : 120 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= PROFILE ================= */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          PROFILE
        </Text>

        <TouchableOpacity
          style={[
            styles.profileCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push("/rider-profile")
          }
        >
          <View
            style={[
              styles.profileIcon,
              {
                backgroundColor:
                  "rgba(0, 229, 255, 0.09)",
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color={cyanColor}
            />
          </View>

          <View style={styles.profileText}>
            <Text
              style={[
                styles.profileName,
                {
                  color: textColor,
                },
              ]}
            >
              Rider Profile
            </Text>

            <Text
              style={[
                styles.profileDescription,
                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              Manage your rider information
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={mutedTextColor}
          />
        </TouchableOpacity>

        {/* ================= BIKE ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          BIKE
        </Text>

        <TouchableOpacity
          style={[
            styles.settingsCard,
            styles.settingRow,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push("/connected-bike")
          }
        >
          <View
            style={[
              styles.iconBoxCyan,
              {
                backgroundColor:
                  "rgba(0, 229, 255, 0.09)",
              },
            ]}
          >
            <Ionicons
              name="bicycle-outline"
              size={22}
              color={cyanColor}
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
              Connected Bike
            </Text>

            <View
              style={styles.connectionRow}
            >
              <View
                style={[
                  styles.connectionDot,
                  {
                    backgroundColor:
                      greenColor,
                  },
                ]}
              />

              <Text
                style={[
                  styles.rowDescription,
                  {
                    color:
                      secondaryTextColor,
                  },
                ]}
              >
                MotoSense system connected
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={mutedTextColor}
          />
        </TouchableOpacity>

        {/* ================= SAFETY ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          SAFETY
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
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/emergency-contacts"
              )
            }
          >
            <View
              style={[
                styles.iconBoxGreen,
                {
                  backgroundColor:
                    "rgba(0, 255, 157, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={22}
                color={greenColor}
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
                Emergency Contacts
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
                Manage your emergency contacts
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={mutedTextColor}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  borderColor,
              },
            ]}
          />

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/sos-settings")
            }
          >
            <View
              style={[
                styles.iconBoxRed,
                {
                  backgroundColor:
                    "rgba(255, 77, 77, 0.09)",
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={redColor}
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
                SOS Settings
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
                Configure emergency response
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={mutedTextColor}
            />
          </TouchableOpacity>
        </View>

        {/* ================= PREFERENCES ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          PREFERENCES
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
          {/* NOTIFICATIONS */}

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                "/notification-settings"
              )
            }
          >
            <View
              style={[
                styles.iconBoxCyan,
                {
                  backgroundColor:
                    "rgba(0, 229, 255, 0.09)",
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={cyanColor}
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
                Notifications
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
                Manage app notifications
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={mutedTextColor}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  borderColor,
              },
            ]}
          />

          {/* APPEARANCE */}

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() =>
              setAppearanceVisible(true)
            }
          >
            <View
              style={[
                styles.iconBoxPurple,
                {
                  backgroundColor:
                    "rgba(124, 58, 237, 0.11)",
                },
              ]}
            >
              <Ionicons
                name="color-palette-outline"
                size={22}
                color={purpleColor}
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
                Appearance
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
                {themeMode === "auto"
                  ? `Auto Adapt • ${currentDisplayMode}`
                  : currentDisplayMode}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={mutedTextColor}
            />
          </TouchableOpacity>
        </View>

        {/* ================= ABOUT ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          ABOUT
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
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/about")
            }
          >
            <View
              style={[
                styles.iconBoxPurple,
                {
                  backgroundColor:
                    "rgba(124, 58, 237, 0.11)",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={purpleColor}
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
                About MotoSense
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
                App information and version
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={mutedTextColor}
            />
          </TouchableOpacity>
        </View>

        {/* ================= VERSION ================= */}

        <Text
          style={[
            styles.versionText,
            {
              color: mutedTextColor,
            },
          ]}
        >
          MOTOSENSE AI
        </Text>

        <Text
          style={[
            styles.versionNumber,
            {
              color: mutedTextColor,
            },
          ]}
        >
          Version 1.0.0
        </Text>
      </ScrollView>

      {/* ================================================== */}
      {/* ADAPTIVE DISPLAY MODAL */}
      {/* ================================================== */}

      <Modal
        visible={appearanceVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setAppearanceVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          {/* BACKDROP */}

          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() =>
              setAppearanceVisible(false)
            }
          />

          {/* SHEET */}

          <View
            style={[
              styles.appearanceSheet,
              {
                backgroundColor: cardColor,
                borderColor,
              },
            ]}
          >
            {/* HANDLE */}

            <View
              style={[
                styles.sheetHandle,
                {
                  backgroundColor:
                    borderColor,
                },
              ]}
            />

            {/* TITLE */}

            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.adaptiveIcon,
                  {
                    backgroundColor:
                      "rgba(124, 58, 237, 0.11)",
                  },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={22}
                  color={purpleColor}
                />
              </View>

              <Text
                style={[
                  styles.sheetTitle,
                  {
                    color: textColor,
                  },
                ]}
              >
                Adaptive Display
              </Text>

              <Text
                style={[
                  styles.sheetSubtitle,
                  {
                    color:
                      secondaryTextColor,
                  },
                ]}
              >
                Let MotoSense adjust the
                interface automatically.
              </Text>
            </View>

            {/* ================= AUTO ADAPT ================= */}

            <View
              style={[
                styles.autoCard,
                {
                  backgroundColor:
                    themeMode === "auto"
                      ? "rgba(124, 58, 237, 0.09)"
                      : "transparent",

                  borderColor:
                    themeMode === "auto"
                      ? purpleColor
                      : borderColor,
                },
              ]}
            >
              <View
                style={[
                  styles.autoIcon,
                  {
                    backgroundColor:
                      themeMode === "auto"
                        ? "rgba(124, 58, 237, 0.14)"
                        : "rgba(125, 135, 153, 0.10)",
                  },
                ]}
              >
                <Ionicons
                  name="contrast-outline"
                  size={22}
                  color={
                    themeMode === "auto"
                      ? purpleColor
                      : mutedTextColor
                  }
                />
              </View>

              <View style={styles.autoText}>
                <Text
                  style={[
                    styles.autoTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Auto Adapt
                </Text>

                <Text
                  style={[
                    styles.autoDescription,
                    {
                      color:
                        secondaryTextColor,
                    },
                  ]}
                >
                  Automatically follow your
                  device appearance.
                </Text>

                {themeMode === "auto" && (
                  <Text
                    style={[
                      styles.currentMode,
                      {
                        color: cyanColor,
                      },
                    ]}
                  >
                    Currently using{" "}
                    {currentDisplayMode}
                  </Text>
                )}
              </View>

              {/* CUSTOM TOGGLE */}

              <TouchableOpacity
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor:
                      themeMode === "auto"
                        ? purpleColor
                        : borderColor,
                  },
                ]}
                activeOpacity={0.8}
                onPress={toggleAutoAdapt}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [
                        {
                          translateX:
                            themeMode === "auto"
                              ? 10
                              : -10,
                        },
                      ],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* ================= DIVIDER ================= */}

            <Text
              style={[
                styles.manualLabel,
                {
                  color: mutedTextColor,
                },
              ]}
            >
              MANUAL MODE
            </Text>

            {/* ================= DAY MODE ================= */}

            <TouchableOpacity
              style={[
                styles.modeOption,
                {
                  backgroundColor:
                    themeMode === "light"
                      ? "rgba(124, 58, 237, 0.09)"
                      : "transparent",

                  borderColor:
                    themeMode === "light"
                      ? purpleColor
                      : borderColor,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                changeTheme("light")
              }
            >
              <View
                style={[
                  styles.modeIcon,
                  {
                    backgroundColor:
                      "rgba(0, 229, 255, 0.09)",
                  },
                ]}
              >
                <Ionicons
                  name="sunny-outline"
                  size={21}
                  color={cyanColor}
                />
              </View>

              <View style={styles.modeText}>
                <Text
                  style={[
                    styles.modeTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Day Mode
                </Text>

                <Text
                  style={[
                    styles.modeDescription,
                    {
                      color:
                        secondaryTextColor,
                    },
                  ]}
                >
                  Bright daytime interface
                </Text>
              </View>

              {themeMode === "light" && (
                <Ionicons
                  name="checkmark-circle"
                  size={23}
                  color={greenColor}
                />
              )}
            </TouchableOpacity>

            {/* ================= NIGHT MODE ================= */}

            <TouchableOpacity
              style={[
                styles.modeOption,
                {
                  backgroundColor:
                    themeMode === "dark"
                      ? "rgba(124, 58, 237, 0.09)"
                      : "transparent",

                  borderColor:
                    themeMode === "dark"
                      ? purpleColor
                      : borderColor,
                },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                changeTheme("dark")
              }
            >
              <View
                style={[
                  styles.modeIcon,
                  {
                    backgroundColor:
                      "rgba(124, 58, 237, 0.11)",
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={21}
                  color={purpleColor}
                />
              </View>

              <View style={styles.modeText}>
                <Text
                  style={[
                    styles.modeTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Night Mode
                </Text>

                <Text
                  style={[
                    styles.modeDescription,
                    {
                      color:
                        secondaryTextColor,
                    },
                  ]}
                >
                  Low-light interface
                </Text>
              </View>

              {themeMode === "dark" && (
                <Ionicons
                  name="checkmark-circle"
                  size={23}
                  color={greenColor}
                />
              )}
            </TouchableOpacity>

            {/* ================= CLOSE ================= */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() =>
                setAppearanceVisible(false)
              }
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: mutedTextColor,
                  },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= BOTTOM NAV ================= */}

      {Platform.OS !== "web" && (
        <View
          style={[
            styles.bottomNav,
          {
            backgroundColor: cardColor,
            borderTopColor: borderColor,
            paddingBottom: Math.max(
              insets.bottom,
              12
            ),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.push("/")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={mutedTextColor}
          />

          <Text
            style={[
              styles.navLabel,
              {
                color: mutedTextColor,
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bar-chart-outline"
            size={24}
            color={mutedTextColor}
          />

          <Text
            style={[
              styles.navLabel,
              {
                color: mutedTextColor,
              },
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={mutedTextColor}
          />

          <Text
            style={[
              styles.navLabel,
              {
                color: mutedTextColor,
              },
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings"
            size={24}
            color={textColor}
          />

          <Text
            style={[
              styles.navLabel,
              {
                color: textColor,
                fontWeight: "700",
              },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ================= SCREEN ================= */

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

  /* ================= SECTION LABEL ================= */

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 1.2,

    marginBottom: 9,
  },

  sectionSpacing: {
    marginTop: 24,
  },

  /* ================= PROFILE ================= */

  profileCard: {
    width: "100%",

    padding: 16,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 18,

    borderWidth: 1,
  },

  profileIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  profileText: {
    flex: 1,
  },

  profileName: {
    fontSize: 15,
    fontWeight: "700",

    marginBottom: 4,
  },

  profileDescription: {
    fontSize: 12,
  },

  /* ================= CARDS ================= */

  settingsCard: {
    width: "100%",

    borderRadius: 18,

    borderWidth: 1,

    overflow: "hidden",
  },

  settingRow: {
    minHeight: 76,

    paddingHorizontal: 15,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
  },

  /* ================= ICON BOXES ================= */

  iconBoxCyan: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  iconBoxGreen: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  iconBoxRed: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  iconBoxPurple: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  /* ================= ROW TEXT ================= */

  rowText: {
    flex: 1,

    marginRight: 8,
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

  /* ================= CONNECTION ================= */

  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  connectionDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 6,
  },

  /* ================= DIVIDER ================= */

  divider: {
    height: 1,

    marginLeft: 70,
  },

  /* ================= VERSION ================= */

  versionText: {
    fontSize: 9,
    fontWeight: "800",

    letterSpacing: 1.5,

    textAlign: "center",

    marginTop: 28,
  },

  versionNumber: {
    fontSize: 10,

    textAlign: "center",

    marginTop: 4,
  },

  /* ================= ADAPTIVE DISPLAY ================= */

  modalOverlay: {
    flex: 1,

    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },

  appearanceSheet: {
    width: "100%",

    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    borderWidth: 1,

    elevation: 20,

    shadowOpacity: 0.25,
    shadowRadius: 20,

    shadowOffset: {
      width: 0,
      height: -5,
    },
  },

  sheetHandle: {
    width: 40,
    height: 4,

    borderRadius: 2,

    alignSelf: "center",

    marginBottom: 18,
  },

  sheetHeader: {
    alignItems: "center",

    marginBottom: 18,
  },

  adaptiveIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",

    marginBottom: 5,
  },

  sheetSubtitle: {
    fontSize: 12,

    textAlign: "center",

    maxWidth: 280,

    lineHeight: 17,
  },

  /* ================= AUTO CARD ================= */

  autoCard: {
    minHeight: 88,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 11,

    borderRadius: 17,

    borderWidth: 1,

    marginBottom: 20,
  },

  autoIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  autoText: {
    flex: 1,

    marginRight: 10,
  },

  autoTitle: {
    fontSize: 14,
    fontWeight: "800",

    marginBottom: 3,
  },

  autoDescription: {
    fontSize: 10.5,

    lineHeight: 15,
  },

  currentMode: {
    fontSize: 10,

    fontWeight: "700",

    marginTop: 5,
  },

  /* ================= CUSTOM TOGGLE ================= */

  toggleTrack: {
    width: 42,
    height: 24,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
  },

  toggleThumb: {
    width: 18,
    height: 18,

    borderRadius: 9,

    backgroundColor: "#FFFFFF",
  },

  /* ================= MANUAL ================= */

  manualLabel: {
    fontSize: 9,
    fontWeight: "800",

    letterSpacing: 1.2,

    marginBottom: 9,
  },

  modeOption: {
    minHeight: 67,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 16,

    borderWidth: 1,

    marginBottom: 9,
  },

  modeIcon: {
    width: 41,
    height: 41,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  modeText: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 14,
    fontWeight: "700",

    marginBottom: 3,
  },

  modeDescription: {
    fontSize: 10.5,
  },

  cancelButton: {
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 2,
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "700",
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingTop: 10,

    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",

    borderTopWidth: 1,
  },

  navItem: {
    flex: 1,

    alignItems: "center",
    justifyContent: "flex-start",
  },

  navLabel: {
    fontSize: 11,
    fontWeight: "600",

    marginTop: 4,
  },
});