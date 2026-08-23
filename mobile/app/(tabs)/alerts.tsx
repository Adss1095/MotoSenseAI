import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  useColorScheme,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  getAlertHistory,
  AlertHistory,
  AlertHistoryEvent,
} from "@/services/api";


type FilterType =
  | "All"
  | "Warnings"
  | "Danger"
  | "SOS";


const filters: FilterType[] = [
  "All",
  "Warnings",
  "Danger",
  "SOS",
];


const formatDuration = (
  seconds: number
) => {

  const totalSeconds =
    Math.max(
      0,
      Math.round(seconds)
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const secs =
    totalSeconds % 60;

  if (minutes > 0) {

    return `${minutes}m ${secs}s`;

  }

  return `${secs}s`;
};


const formatTime = (
  timestamp: number
) => {

  return new Date(
    timestamp * 1000
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const getEventType = (
  event: AlertHistoryEvent
) => {

  if (
    event.key === "sos"
  ) {

    return "sos";

  }

  if (
    event.level === "DANGER"
  ) {

    return "danger";

  }

  return "warning";
};


const getEventIcon = (
  event: AlertHistoryEvent
): keyof typeof Ionicons.glyphMap => {

  if (
    event.key === "sos"
  ) {

    return "alert-circle-outline";

  }

  if (
    event.source === "front"
  ) {

    return "arrow-up-circle-outline";

  }

  return "arrow-down-circle-outline";
};


const getEventColor = (
  event: AlertHistoryEvent
) => {

  if (
    event.key === "sos"
  ) {

    return "#FF453A";

  }

  if (
    event.level === "DANGER"
  ) {

    return "#FF453A";

  }

  return "#FFB800";
};


export default function Alerts() {

  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>(
      "All"
    );

  const [history, setHistory] =
    useState<AlertHistory | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);


  const insets =
    useSafeAreaInsets();

  const colorScheme =
    useColorScheme();

  const isDark =
    colorScheme !== "light";


  const colors = {

    background:
      isDark
        ? "#0A0F1A"
        : "#F6F8FC",

    card:
      isDark
        ? "#131824"
        : "#FFFFFF",

    border:
      isDark
        ? "#1C2333"
        : "#E3E8F0",

    primaryText:
      isDark
        ? "#F6F8FC"
        : "#0A0F1A",

    secondaryText:
      isDark
        ? "#8F98AA"
        : "#667085",

    timeText:
      isDark
        ? "#9AA3B5"
        : "#667085",

  };


  // ==========================================================
  // LIVE HISTORY POLLING
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const loadHistory =
      async () => {

        try {

          const data =
            await getAlertHistory();

          if (mounted) {

            setHistory(data);

            setLoading(false);

          }

        } catch (error) {

          console.log(
            "Alert history error:",
            error
          );

          if (mounted) {

            setLoading(false);

          }

        }

      };


    loadHistory();


    const interval =
      setInterval(
        loadHistory,
        1000
      );


    return () => {

      mounted = false;

      clearInterval(
        interval
      );

    };

  }, []);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary =
    history?.summary;


  const warningCount =
    (summary?.front_warning.count ?? 0)
    +
    (summary?.rear_warning.count ?? 0);


  const dangerCount =
    (summary?.front_danger.count ?? 0)
    +
    (summary?.rear_danger.count ?? 0);


  const sosCount =
    summary?.sos.count ?? 0;


  const warningDuration =
    (summary?.front_warning.total_duration_s ?? 0)
    +
    (summary?.rear_warning.total_duration_s ?? 0);


  const dangerDuration =
    (summary?.front_danger.total_duration_s ?? 0)
    +
    (summary?.rear_danger.total_duration_s ?? 0);


  const sosDuration =
    summary?.sos.total_duration_s ?? 0;


  // ==========================================================
  // FILTER EVENTS
  // ==========================================================

  const filteredEvents =
    useMemo(() => {

      const events =
        history?.events ?? [];

      return events
        .slice()
        .reverse()
        .filter(
          (event) => {

            const type =
              getEventType(
                event
              );

            if (
              selectedFilter ===
              "All"
            ) {

              return true;

            }

            if (
              selectedFilter ===
              "Warnings"
            ) {

              return (
                type === "warning"
              );

            }

            if (
              selectedFilter ===
              "Danger"
            ) {

              return (
                type === "danger"
              );

            }

            if (
              selectedFilter ===
              "SOS"
            ) {

              return (
                type === "sos"
              );

            }

            return true;

          }
        );

    }, [
      history,
      selectedFilter,
    ]);


  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >

      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          colors.background
        }
      />


      {/* SAFE AREA */}

      <View
        style={[
          styles.topSafeArea,
          {
            height:
              insets.top,

            backgroundColor:
              colors.background,
          },
        ]}
      />


      {/* HEADER */}

      <View
        style={styles.header}
      >

        <View
          style={
            styles.headerSide
          }
        />

        <Text
          style={[
            styles.headerTitle,
            {
              color:
                colors.primaryText,
            },
          ]}
        >
          Alerts
        </Text>

        <View
          style={
            styles.headerSide
          }
        />

      </View>


      {/* FILTERS */}

      <View
        style={
          styles.filterContainer
        }
      >

        {filters.map(
          (filter) => {

            const selected =
              selectedFilter ===
              filter;

            return (

              <Pressable
                key={filter}
                onPress={() =>
                  setSelectedFilter(
                    filter
                  )
                }
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      colors.card,

                    borderColor:
                      colors.border,
                  },

                  selected &&
                    styles.filterPillSelected,
                ]}
              >

                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selected
                          ? "#FFFFFF"
                          : colors.secondaryText,
                    },
                  ]}
                >
                  {filter}
                </Text>

              </Pressable>

            );

          }
        )}

      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 100,
          },
        ]}
      >


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.primaryText,
            },
          ]}
        >
          Live Summary
        </Text>


        <View
          style={
            styles.summaryGrid
          }
        >

          <SummaryCard
            title="Warnings"
            count={warningCount}
            duration={
              warningDuration
            }
            color="#FFB800"
            colors={colors}
          />


          <SummaryCard
            title="Danger"
            count={dangerCount}
            duration={
              dangerDuration
            }
            color="#FF453A"
            colors={colors}
          />


          <SummaryCard
            title="SOS"
            count={sosCount}
            duration={
              sosDuration
            }
            color="#FF453A"
            colors={colors}
          />

        </View>


        {/* ==================================================
            CURRENTLY ACTIVE
        ================================================== */}

        {(history?.active.length ?? 0) >
          0 && (

          <View>

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              Currently Active
            </Text>


            {history?.active.map(
              (alert) => (

                <View
                  key={
                    alert.key
                  }
                  style={[
                    styles.activeCard,
                    {
                      backgroundColor:
                        colors.card,

                      borderColor:
                        colors.border,
                    },
                  ]}
                >

                  <View
                    style={[
                      styles.activeIcon,
                      {
                        backgroundColor:
                          "rgba(255,69,58,0.12)",
                      },
                    ]}
                  >

                    <Ionicons
                      name={
                        alert.key ===
                        "sos"
                          ? "alert-circle-outline"
                          : "warning-outline"
                      }
                      size={24}
                      color={
                        alert.level ===
                        "WARNING"
                          ? "#FFB800"
                          : "#FF453A"
                      }
                    />

                  </View>


                  <View
                    style={
                      styles.activeContent
                    }
                  >

                    <Text
                      style={[
                        styles.activeTitle,
                        {
                          color:
                            colors.primaryText,
                        },
                      ]}
                    >
                      {alert.title}
                    </Text>


                    <Text
                      style={[
                        styles.activeDescription,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Active for{" "}
                      {formatDuration(
                        alert.duration_s
                      )}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.liveBadge
                    }
                  >

                    <View
                      style={
                        styles.liveDot
                      }
                    />

                    <Text
                      style={
                        styles.liveText
                      }
                    >
                      LIVE
                    </Text>

                  </View>

                </View>

              )
            )}

          </View>

        )}


        {/* ==================================================
            HISTORY
        ================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                colors.primaryText,
            },
          ]}
        >
          Alert History
        </Text>


        {loading ? (

          <View
            style={
              styles.emptyState
            }
          >

            <Ionicons
              name="sync-outline"
              size={30}
              color="#7C3AED"
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              Loading live alerts...
            </Text>

          </View>

        ) : filteredEvents.length ===
          0 ? (

          <View
            style={
              styles.emptyState
            }
          >

            <Ionicons
              name="shield-checkmark-outline"
              size={40}
              color="#00C985"
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.primaryText,
                },
              ]}
            >
              No alerts yet
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Warnings and dangers will
              appear here automatically.
            </Text>

          </View>

        ) : (

          filteredEvents.map(
            (event, index) => {

              const color =
                getEventColor(
                  event
                );

              const active =
                event.end_time ===
                null;

              return (

                <View
                  key={`${event.key}-${event.start_time}-${index}`}
                  style={[
                    styles.alertCard,
                    {
                      backgroundColor:
                        colors.card,

                      borderColor:
                        colors.border,
                    },
                  ]}
                >

                  <View
                    style={[
                      styles.alertIconContainer,
                      {
                        backgroundColor:
                          `${color}18`,
                      },
                    ]}
                  >

                    <Ionicons
                      name={
                        getEventIcon(
                          event
                        )
                      }
                      size={24}
                      color={color}
                    />

                  </View>


                  <View
                    style={
                      styles.alertContent
                    }
                  >

                    <Text
                      style={[
                        styles.alertTitle,
                        {
                          color:
                            colors.primaryText,
                        },
                      ]}
                    >
                      {event.title}
                    </Text>


                    <Text
                      style={[
                        styles.alertDescription,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      {event.level}
                      {" • "}
                      {active
                        ? "Currently active"
                        : `Duration ${formatDuration(
                            event.duration_s
                          )}`}
                    </Text>


                    <Text
                      style={[
                        styles.alertStartTime,
                        {
                          color:
                            colors.timeText,
                        },
                      ]}
                    >
                      Started{" "}
                      {formatTime(
                        event.start_time
                      )}
                    </Text>

                  </View>


                  {active && (

                    <View
                      style={
                        styles.liveBadge
                      }
                    >

                      <View
                        style={
                          styles.liveDot
                        }
                      />

                      <Text
                        style={
                          styles.liveText
                        }
                      >
                        LIVE
                      </Text>

                    </View>

                  )}

                </View>

              );

            }
          )

        )}

      </ScrollView>

    </View>

  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  count,
  duration,
  color,
  colors,
}: {
  title: string;

  count: number;

  duration: number;

  color: string;

  colors: {
    card: string;
    border: string;
    primaryText: string;
    secondaryText: string;
  };
}) {

  return (

    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor:
            colors.card,

          borderColor:
            colors.border,
        },
      ]}
    >

      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >

        <Ionicons
          name={
            title === "SOS"
              ? "alert-circle-outline"
              : title === "Danger"
              ? "warning-outline"
              : "notifications-outline"
          }
          size={22}
          color={color}
        />

      </View>


      <Text
        style={[
          styles.summaryTitle,
          {
            color:
              colors.secondaryText,
          },
        ]}
      >
        {title}
      </Text>


      <Text
        style={[
          styles.summaryCount,
          {
            color,
          },
        ]}
      >
        {count}
      </Text>


      <Text
        style={[
          styles.summaryDuration,
          {
            color:
              colors.secondaryText,
          },
        ]}
      >
        {formatDuration(
          duration
        )}
      </Text>

    </View>

  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },

    topSafeArea: {
      width: "100%",
    },


    header: {
      height: 58,

      paddingHorizontal: 18,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    headerSide: {
      width: 35,
    },

    headerTitle: {
      fontSize: 21,
      fontWeight: "800",
    },


    filterContainer: {

      flexDirection:
        "row",

      paddingHorizontal: 18,

      gap: 8,

      marginBottom: 8,
    },

    filterPill: {

      flex: 1,

      height: 38,

      borderRadius: 19,

      borderWidth: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    filterPillSelected: {

      backgroundColor:
        "#7C3AED",

      borderColor:
        "#7C3AED",
    },

    filterText: {

      fontSize: 12,

      fontWeight: "700",
    },


    scrollContent: {

      paddingHorizontal: 18,

      paddingTop: 4,
    },


    sectionTitle: {

      fontSize: 18,

      fontWeight: "800",

      marginTop: 14,

      marginBottom: 10,
    },


    summaryGrid: {

      flexDirection:
        "row",

      gap: 8,
    },

    summaryCard: {

      flex: 1,

      minHeight: 142,

      borderRadius: 17,

      borderWidth: 1,

      padding: 12,

      alignItems:
        "center",
    },

    summaryIcon: {

      width: 40,

      height: 40,

      borderRadius: 13,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 7,
    },

    summaryTitle: {

      fontSize: 12,

      fontWeight: "700",
    },

    summaryCount: {

      fontSize: 28,

      fontWeight: "900",

      marginTop: 2,
    },

    summaryDuration: {

      fontSize: 11,

      marginTop: 1,
    },


    activeCard: {

      minHeight: 76,

      borderRadius: 17,

      borderWidth: 1,

      paddingHorizontal: 13,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 9,
    },

    activeIcon: {

      width: 46,

      height: 46,

      borderRadius: 14,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 12,
    },

    activeContent: {

      flex: 1,
    },

    activeTitle: {

      fontSize: 15,

      fontWeight: "800",

      marginBottom: 4,
    },

    activeDescription: {

      fontSize: 12,
    },


    liveBadge: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 10,

      backgroundColor:
        "rgba(0,201,133,0.10)",
    },

    liveDot: {

      width: 6,

      height: 6,

      borderRadius: 3,

      backgroundColor:
        "#00C985",
    },

    liveText: {

      fontSize: 9,

      fontWeight: "900",

      color:
        "#00C985",
    },


    alertCard: {

      minHeight: 82,

      borderRadius: 17,

      borderWidth: 1,

      marginBottom: 9,

      paddingHorizontal: 13,

      paddingVertical: 10,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    alertIconContainer: {

      width: 48,

      height: 48,

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 12,
    },

    alertContent: {

      flex: 1,

      paddingRight: 5,
    },

    alertTitle: {

      fontSize: 15,

      fontWeight: "800",

      marginBottom: 4,
    },

    alertDescription: {

      fontSize: 12.5,

      marginBottom: 3,
    },

    alertStartTime: {

      fontSize: 10.5,
    },


    emptyState: {

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingTop: 70,

      paddingHorizontal: 30,
    },

    emptyTitle: {

      fontSize: 17,

      fontWeight: "800",

      marginTop: 12,

      marginBottom: 6,
    },

    emptyDescription: {

      fontSize: 13,

      textAlign:
        "center",
    },

  });