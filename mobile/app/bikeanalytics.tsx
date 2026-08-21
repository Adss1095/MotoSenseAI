import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BikeAnalyticsProps = {
  embedded?: boolean;
};

export default function BikeAnalytics({ embedded = false }: BikeAnalyticsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: embedded ? 16 : insets.top + 8,
          },
        ]}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* =========================================================
            BIKE ANALYTICS HEADER
        ========================================================= */}

        <View style={styles.analyticsHeading}>
          <View>
            <Text style={styles.analyticsTitle}>BIKE ANALYTICS</Text>

            <Text style={styles.analyticsSubtitle}>
              Live performance and riding insights
            </Text>
          </View>

          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />

            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>

        {/* =========================================================
            LIVE BIKE METRICS
        ========================================================= */}

        <View style={styles.metricsGrid}>
          {/* FUEL */}

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricTop}>
              <View style={styles.blueMetricIcon}>
                <Text style={styles.analyticsIcon}>⛽</Text>
              </View>

              <Text style={styles.analyticsMetricLabel}>FUEL LEVEL</Text>
            </View>

            <Text style={styles.analyticsMetricValue}>65%</Text>

            <Text style={styles.analyticsMetricSub}>12.8 L remaining</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: "65%",
                  },
                ]}
              />
            </View>
          </View>

          {/* BATTERY */}

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricTop}>
              <View style={styles.greenMetricIcon}>
                <Text style={styles.analyticsIcon}>▣</Text>
              </View>

              <Text style={styles.analyticsMetricLabel}>BATTERY</Text>
            </View>

            <Text style={styles.analyticsMetricValue}>13.2 V</Text>

            <Text style={styles.analyticsMetricSub}>Battery health: Good</Text>

            <View style={styles.goodBadge}>
              <Text style={styles.goodBadgeText}>GOOD</Text>
            </View>
          </View>

          {/* ENGINE TEMPERATURE */}

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricTop}>
              <View style={styles.yellowMetricIcon}>
                <Text style={styles.analyticsIcon}>◉</Text>
              </View>

              <Text style={styles.analyticsMetricLabel}>ENGINE TEMP</Text>
            </View>

            <Text style={styles.analyticsMetricValue}>78°C</Text>

            <Text style={styles.analyticsMetricSub}>
              Normal operating range
            </Text>

            <View style={styles.normalBadge}>
              <Text style={styles.normalBadgeText}>NORMAL</Text>
            </View>
          </View>

          {/* ODOMETER */}

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricTop}>
              <View style={styles.purpleMetricIcon}>
                <Text style={styles.analyticsIcon}>◉</Text>
              </View>

              <Text style={styles.analyticsMetricLabel}>ODOMETER</Text>
            </View>

            <Text style={styles.analyticsMetricValue}>12,450</Text>

            <Text style={styles.analyticsMetricSub}>Total kilometres</Text>

            <Text style={styles.kmText}>km</Text>
          </View>
        </View>

        {/* =========================================================
            RIDING SUMMARY
        ========================================================= */}

        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>RIDING SUMMARY</Text>

              <Text style={styles.smallSubtitle}>
                Your performance this week
              </Text>
            </View>

            <View style={styles.periodButton}>
              <Text style={styles.periodText}>This Week</Text>

              <Text style={styles.periodArrow}>˅</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIconBlue}>⌖</Text>

              <Text style={styles.summaryLabel}>TOTAL DISTANCE</Text>

              <Text style={styles.summaryValue}>128.6 km</Text>

              <Text style={styles.summaryChange}>↑ 18% vs last week</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIconGreen}>◷</Text>

              <Text style={styles.summaryLabel}>TOTAL TIME</Text>

              <Text style={styles.summaryValue}>6h 24m</Text>

              <Text style={styles.summaryChange}>↑ 12% vs last week</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIconYellow}>◉</Text>

              <Text style={styles.summaryLabel}>AVG SPEED</Text>

              <Text style={styles.summaryValue}>42 km/h</Text>

              <Text style={styles.summaryChange}>↑ 5% vs last week</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIconPurple}>⛽</Text>

              <Text style={styles.summaryLabel}>FUEL EFFICIENCY</Text>

              <Text style={styles.summaryValue}>32.4 km/l</Text>

              <Text style={styles.summaryChange}>↑ 8% vs last week</Text>
            </View>
          </View>
        </View>

        {/* =========================================================
            FUEL EFFICIENCY TREND
        ========================================================= */}

        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>FUEL EFFICIENCY TREND</Text>

              <Text style={styles.smallSubtitle}>Last 7 days</Text>
            </View>

            <Text style={styles.chartUnit}>km/l</Text>
          </View>

          {/* CHART */}

          <View style={styles.chart}>
            <View style={styles.chartGridLineOne} />
            <View style={styles.chartGridLineTwo} />
            <View style={styles.chartGridLineThree} />
            <View style={styles.chartGridLineFour} />

            <View style={styles.chartYLabel40}>
              <Text style={styles.chartLabel}>40</Text>
            </View>

            <View style={styles.chartYLabel30}>
              <Text style={styles.chartLabel}>30</Text>
            </View>

            <View style={styles.chartYLabel20}>
              <Text style={styles.chartLabel}>20</Text>
            </View>

            <View style={styles.chartYLabel10}>
              <Text style={styles.chartLabel}>10</Text>
            </View>

            {/* DATA POINTS */}

            <View
              style={[
                styles.chartPoint,
                {
                  left: "9%",
                  top: "43%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "23%",
                  top: "34%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "37%",
                  top: "27%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "51%",
                  top: "24%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "65%",
                  top: "21%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "79%",
                  top: "29%",
                },
              ]}
            />

            <View
              style={[
                styles.chartPoint,
                {
                  left: "93%",
                  top: "23%",
                },
              ]}
            />

            {/* TREND LINE */}

            <View
              style={[
                styles.chartSegment,
                {
                  left: "9%",
                  top: "43%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "-12deg",
                    },
                  ],
                },
              ]}
            />

            <View
              style={[
                styles.chartSegment,
                {
                  left: "23%",
                  top: "34%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "-9deg",
                    },
                  ],
                },
              ]}
            />

            <View
              style={[
                styles.chartSegment,
                {
                  left: "37%",
                  top: "27%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "-3deg",
                    },
                  ],
                },
              ]}
            />

            <View
              style={[
                styles.chartSegment,
                {
                  left: "51%",
                  top: "24%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "3deg",
                    },
                  ],
                },
              ]}
            />

            <View
              style={[
                styles.chartSegment,
                {
                  left: "65%",
                  top: "21%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "8deg",
                    },
                  ],
                },
              ]}
            />

            <View
              style={[
                styles.chartSegment,
                {
                  left: "79%",
                  top: "29%",
                  width: "15%",
                  transform: [
                    {
                      rotate: "-5deg",
                    },
                  ],
                },
              ]}
            />

            {/* VALUES */}

            <Text
              style={[
                styles.chartValue,
                {
                  left: "5%",
                  top: "34%",
                },
              ]}
            >
              28.1
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  left: "19%",
                  top: "25%",
                },
              ]}
            >
              30.2
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  left: "33%",
                  top: "18%",
                },
              ]}
            >
              31.8
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  left: "47%",
                  top: "15%",
                },
              ]}
            >
              32.4
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  left: "61%",
                  top: "12%",
                },
              ]}
            >
              33.1
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  left: "75%",
                  top: "20%",
                },
              ]}
            >
              31.0
            </Text>

            <Text
              style={[
                styles.chartValue,
                {
                  right: "2%",
                  top: "14%",
                },
              ]}
            >
              32.4
            </Text>

            {/* DAYS */}

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "6%",
                },
              ]}
            >
              Tue
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "20%",
                },
              ]}
            >
              Wed
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "34%",
                },
              ]}
            >
              Thu
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "48%",
                },
              ]}
            >
              Fri
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "62%",
                },
              ]}
            >
              Sat
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  left: "76%",
                },
              ]}
            >
              Sun
            </Text>

            <Text
              style={[
                styles.dayLabel,
                {
                  right: "2%",
                  color: "#168BFF",
                },
              ]}
            >
              Mon
            </Text>
          </View>
        </View>

        {/* =========================================================
            RIDE BREAKDOWN
        ========================================================= */}

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>RIDE BREAKDOWN</Text>

          <View style={styles.breakdownContent}>
            <View style={styles.breakdownCircle}>
              <View style={styles.breakdownInner}>
                <Text style={styles.breakdownValue}>128.6</Text>

                <Text style={styles.breakdownUnit}>total km</Text>
              </View>
            </View>

            <View style={styles.breakdownLegend}>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#168BFF",
                    },
                  ]}
                />

                <Text style={styles.legendName}>City</Text>

                <Text style={styles.legendPercent}>62%</Text>

                <Text style={styles.legendDistance}>79.7 km</Text>
              </View>

              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#36D48B",
                    },
                  ]}
                />

                <Text style={styles.legendName}>Highway</Text>

                <Text style={styles.legendPercent}>28%</Text>

                <Text style={styles.legendDistance}>35.9 km</Text>
              </View>

              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: "#F5B83D",
                    },
                  ]}
                />

                <Text style={styles.legendName}>Long Ride</Text>

                <Text style={styles.legendPercent}>10%</Text>

                <Text style={styles.legendDistance}>12.9 km</Text>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================
            MAINTENANCE
        ========================================================= */}

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>MAINTENANCE REMINDER</Text>

          <View style={styles.maintenanceContent}>
            <View style={styles.maintenanceIcon}>
              <Text style={styles.maintenanceIconText}>⚒</Text>
            </View>

            <View style={styles.maintenanceInfo}>
              <Text style={styles.maintenanceSmall}>NEXT SERVICE DUE IN</Text>

              <Text style={styles.maintenanceValue}>1,250 km</Text>

              <Text style={styles.maintenanceSmall}>or 30 days</Text>
            </View>
          </View>

          <View style={styles.serviceProgressTrack}>
            <View style={styles.serviceProgressFill} />
          </View>

          <View style={styles.serviceBottomRow}>
            <Text style={styles.serviceLast}>Last service: 2,850 km</Text>

            <Text style={styles.serviceDate}>12 Jul 2026</Text>
          </View>
        </View>

        {/* =========================================================
            END
        ========================================================= */}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ===============================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: "#050B14",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* =============================================================
     HEADER
  ============================================================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  brand: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  brandAI: {
    color: "#00E5FF",
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#718294",
    fontSize: 8,
    letterSpacing: 1.7,
    marginTop: 4,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0D1724",
    borderWidth: 1,
    borderColor: "#1C2D3D",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationIcon: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  notificationDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00E5FF",
    top: 7,
    right: 7,
  },

  /* =============================================================
     GREETING
  ============================================================= */

  greeting: {
    marginBottom: 18,
  },

  greetingTitle: {
    color: "#F6F8FC",
    fontSize: 23,
    fontWeight: "700",
  },

  greetingSubtitle: {
    color: "#8998A8",
    fontSize: 13,
    marginTop: 5,
  },

  /* =============================================================
     SYSTEM STATUS
  ============================================================= */

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C1724",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1B2D3E",
    padding: 17,
    marginBottom: 18,
  },

  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#102B2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  statusGlow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#153E35",
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#36D48B",
  },

  statusTextContainer: {
    flex: 1,
  },

  statusLabel: {
    color: "#718294",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  statusTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },

  statusDescription: {
    color: "#8998A8",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  /* =============================================================
     GENERAL CARD
  ============================================================= */

  sectionCard: {
    backgroundColor: "#0C1724",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#1B2D3E",
    padding: 17,
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  cardArrow: {
    color: "#718294",
    fontSize: 20,
  },

  smallSubtitle: {
    color: "#718294",
    fontSize: 9,
    marginTop: 4,
  },

  /* =============================================================
     TODAY'S RIDE
  ============================================================= */

  rideMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },

  rideMetric: {
    flex: 1,
    alignItems: "center",
  },

  verticalDivider: {
    width: 1,
    height: 65,
    backgroundColor: "#263748",
  },

  metricIconBlue: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#102B49",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  metricIconPurple: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#281E42",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  metricIconGreen: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#103329",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  metricIconText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  metricUnit: {
    color: "#8998A8",
    fontSize: 11,
    fontWeight: "500",
  },

  metricLabel: {
    color: "#718294",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.6,
  },

  safetySummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#091E1A",
    borderRadius: 10,
    padding: 10,
    marginTop: 18,
  },

  safetyIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#103329",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  safetyIconText: {
    color: "#36D48B",
    fontWeight: "800",
  },

  safetyText: {
    color: "#9BAABA",
    fontSize: 10,
    flex: 1,
  },

  /* =============================================================
     ANALYTICS HEADING
  ============================================================= */

  analyticsHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 0,
    marginBottom: 15,
  },

  analyticsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  analyticsSubtitle: {
    color: "#718294",
    fontSize: 10,
    marginTop: 4,
  },

  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E251F",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E4439",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#36D48B",
    marginRight: 6,
  },

  connectedText: {
    color: "#36D48B",
    fontSize: 9,
    fontWeight: "700",
  },

  /* =============================================================
     ANALYTICS METRICS
  ============================================================= */

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  analyticsMetricCard: {
    width: "48.5%",
    backgroundColor: "#0C1724",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#1B2D3E",
    padding: 14,
    marginBottom: 12,
    minHeight: 155,
  },

  analyticsMetricTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  blueMetricIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#102B49",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  greenMetricIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#103329",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  yellowMetricIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#302A16",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  purpleMetricIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#281E42",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  analyticsIcon: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  analyticsMetricLabel: {
    color: "#718294",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.4,
    flex: 1,
  },

  analyticsMetricValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 15,
  },

  analyticsMetricSub: {
    color: "#8998A8",
    fontSize: 9,
    marginTop: 4,
  },

  progressTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: "#263748",
    marginTop: 13,
    overflow: "hidden",
  },

  progressFill: {
    height: 5,
    borderRadius: 4,
    backgroundColor: "#168BFF",
  },

  goodBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#103329",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 9,
  },

  goodBadgeText: {
    color: "#36D48B",
    fontSize: 8,
    fontWeight: "800",
  },

  normalBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#302A16",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 9,
  },

  normalBadgeText: {
    color: "#F5B83D",
    fontSize: 8,
    fontWeight: "800",
  },

  kmText: {
    color: "#718294",
    fontSize: 10,
    marginTop: 2,
  },

  /* =============================================================
     RIDING SUMMARY
  ============================================================= */

  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#132231",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  periodText: {
    color: "#FFFFFF",
    fontSize: 9,
  },

  periodArrow: {
    color: "#718294",
    fontSize: 12,
    marginLeft: 5,
  },

  summaryGrid: {
    flexDirection: "row",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 3,
  },

  summaryIconBlue: {
    color: "#168BFF",
    fontSize: 23,
    marginBottom: 7,
  },

  summaryIconGreen: {
    color: "#36D48B",
    fontSize: 23,
    marginBottom: 7,
  },

  summaryIconYellow: {
    color: "#F5B83D",
    fontSize: 23,
    marginBottom: 7,
  },

  summaryIconPurple: {
    color: "#A66CFF",
    fontSize: 23,
    marginBottom: 7,
  },

  summaryLabel: {
    color: "#718294",
    fontSize: 7,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
    textAlign: "center",
  },

  summaryChange: {
    color: "#36D48B",
    fontSize: 7,
    marginTop: 5,
    textAlign: "center",
  },

  /* =============================================================
     CHART
  ============================================================= */

  chartUnit: {
    color: "#718294",
    fontSize: 9,
  },

  chart: {
    height: 210,
    position: "relative",
    marginTop: 8,
    marginHorizontal: 2,
  },

  chartGridLineOne: {
    position: "absolute",
    left: 30,
    right: 0,
    top: "16%",
    height: 1,
    backgroundColor: "#1E2E3D",
  },

  chartGridLineTwo: {
    position: "absolute",
    left: 30,
    right: 0,
    top: "36%",
    height: 1,
    backgroundColor: "#1E2E3D",
  },

  chartGridLineThree: {
    position: "absolute",
    left: 30,
    right: 0,
    top: "56%",
    height: 1,
    backgroundColor: "#1E2E3D",
  },

  chartGridLineFour: {
    position: "absolute",
    left: 30,
    right: 0,
    top: "76%",
    height: 1,
    backgroundColor: "#1E2E3D",
  },

  chartYLabel40: {
    position: "absolute",
    left: 0,
    top: "11%",
  },

  chartYLabel30: {
    position: "absolute",
    left: 0,
    top: "31%",
  },

  chartYLabel20: {
    position: "absolute",
    left: 0,
    top: "51%",
  },

  chartYLabel10: {
    position: "absolute",
    left: 0,
    top: "71%",
  },

  chartLabel: {
    color: "#718294",
    fontSize: 8,
  },

  chartPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#168BFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 3,
  },

  chartSegment: {
    position: "absolute",
    height: 3,
    backgroundColor: "#168BFF",
    borderRadius: 5,
    transformOrigin: "left center",
  },

  chartValue: {
    position: "absolute",
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "700",
  },

  dayLabel: {
    position: "absolute",
    bottom: 5,
    color: "#718294",
    fontSize: 8,
  },

  /* =============================================================
     BREAKDOWN
  ============================================================= */

  breakdownContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  breakdownCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    borderWidth: 18,
    borderTopColor: "#168BFF",
    borderRightColor: "#168BFF",
    borderBottomColor: "#36D48B",
    borderLeftColor: "#F5B83D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  breakdownInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#0C1724",
    alignItems: "center",
    justifyContent: "center",
  },

  breakdownValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  breakdownUnit: {
    color: "#718294",
    fontSize: 9,
    marginTop: 3,
  },

  breakdownLegend: {
    flex: 1,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },

  legendName: {
    color: "#C9D2DC",
    fontSize: 10,
    flex: 1,
  },

  legendPercent: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginRight: 8,
  },

  legendDistance: {
    color: "#718294",
    fontSize: 9,
  },

  /* =============================================================
     MAINTENANCE
  ============================================================= */

  maintenanceContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  maintenanceIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#102B49",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  maintenanceIconText: {
    color: "#FFFFFF",
    fontSize: 25,
  },

  maintenanceInfo: {
    flex: 1,
  },

  maintenanceSmall: {
    color: "#8998A8",
    fontSize: 9,
  },

  maintenanceValue: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginVertical: 4,
  },

  serviceProgressTrack: {
    height: 7,
    backgroundColor: "#263748",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 20,
  },

  serviceProgressFill: {
    width: "62%",
    height: 7,
    backgroundColor: "#168BFF",
    borderRadius: 5,
  },

  serviceBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  serviceLast: {
    color: "#8998A8",
    fontSize: 9,
  },

  serviceDate: {
    color: "#718294",
    fontSize: 9,
  },

  /* =============================================================
     AI INSIGHTS
  ============================================================= */

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  insightSpark: {
    color: "#A66CFF",
    fontSize: 20,
    marginRight: 8,
  },

  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09121D",
    borderRadius: 13,
    padding: 12,
    marginTop: 9,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  insightIconText: {
    fontSize: 17,
    fontWeight: "800",
  },

  insightText: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },

  insightDescription: {
    color: "#8998A8",
    fontSize: 9,
    lineHeight: 14,
  },

  bottomSpace: {
    height: 30,
  },
});