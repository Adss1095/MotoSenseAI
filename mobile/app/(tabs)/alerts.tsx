import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'All' | 'Warnings' | 'SOS' | 'System';

type AlertItem = {
  type: 'warning' | 'sos' | 'system';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
};

const todayAlerts: AlertItem[] = [
  {
    type: 'warning',
    icon: 'eye-outline',
    title: 'Blind Spot Warning',
    description: 'Vehicle detected in right blind spot',
    time: '08:42 PM',
  },
  {
    type: 'warning',
    icon: 'warning-outline',
    title: 'Front Obstacle',
    description: 'Obstacle detected 2.3m ahead',
    time: '08:31 PM',
  },
  {
    type: 'system',
    icon: 'checkmark-circle-outline',
    title: 'System Check',
    description: 'All systems operational',
    time: '07:15 PM',
  },
  {
    type: 'sos',
    icon: 'alert-circle-outline',
    title: 'Crash Detected',
    description: 'SOS alert sent to emergency contacts',
    time: '06:48 PM',
  },
];

const yesterdayAlerts: AlertItem[] = [
  {
    type: 'warning',
    icon: 'arrow-down-circle-outline',
    title: 'Rear Obstacle',
    description: 'Obstacle detected behind',
    time: '09:10 PM',
  },
  {
    type: 'system',
    icon: 'play-circle-outline',
    title: 'Ride Started',
    description: 'Ride tracking initiated',
    time: '08:02 AM',
  },
];

const filters: FilterType[] = [
  'All',
  'Warnings',
  'SOS',
  'System',
];

const alertColors = {
  warning: {
    primary: '#FFB800',
    darkBackground: 'rgba(255, 184, 0, 0.10)',
    lightBackground: 'rgba(255, 184, 0, 0.12)',
  },
  sos: {
    primary: '#FF4D4D',
    darkBackground: 'rgba(255, 77, 77, 0.10)',
    lightBackground: 'rgba(255, 77, 77, 0.10)',
  },
  system: {
    primary: '#00C985',
    darkBackground: 'rgba(0, 255, 157, 0.10)',
    lightBackground: 'rgba(0, 200, 133, 0.10)',
  },
};

export default function Alerts() {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>('All');

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const isDark = colorScheme !== 'light';

  /*
   * ============================
   * THEME COLORS
   * ============================
   */

  const colors = {
    background: isDark
      ? '#0A0F1A'
      : '#F6F8FC',

    card: isDark
      ? '#131824'
      : '#FFFFFF',

    border: isDark
      ? '#1C2333'
      : '#E3E8F0',

    primaryText: isDark
      ? '#F6F8FC'
      : '#0A0F1A',

    secondaryText: isDark
      ? '#8F98AA'
      : '#667085',

    timeText: isDark
      ? '#9AA3B5'
      : '#667085',

    filterText: isDark
      ? '#A7AFBF'
      : '#667085',

    selectedFilterText: '#FFFFFF',

    navIcon: isDark
      ? '#8F98AA'
      : '#667085',
  };

  const filterAlerts = (alerts: AlertItem[]) => {
    if (selectedFilter === 'All') {
      return alerts;
    }

    if (selectedFilter === 'Warnings') {
      return alerts.filter(
        (alert) => alert.type === 'warning'
      );
    }

    if (selectedFilter === 'SOS') {
      return alerts.filter(
        (alert) => alert.type === 'sos'
      );
    }

    return alerts.filter(
      (alert) => alert.type === 'system'
    );
  };

  const filteredToday = filterAlerts(todayAlerts);
  const filteredYesterday =
    filterAlerts(yesterdayAlerts);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* SAFE AREA */}
      <View
        style={[
          styles.topSafeArea,
          {
            height: insets.top,
            backgroundColor:
              colors.background,
          },
        ]}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerSide} />

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.primaryText,
            },
          ]}
        >
          Alerts
        </Text>

        <Pressable
          style={styles.filterButton}
          hitSlop={8}
        >
          <Ionicons
            name="filter-outline"
            size={22}
            color={colors.primaryText}
          />
        </Pressable>
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isSelected =
            selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() =>
                setSelectedFilter(filter)
              }
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
                isSelected &&
                  styles.filterPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      colors.filterText,
                  },
                  isSelected && {
                    color:
                      colors.selectedFilterText,
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ALERT LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 88,
          },
        ]}
      >
        {filteredToday.length > 0 && (
          <AlertSection
            title="Today"
            alerts={filteredToday}
            colors={colors}
            isDark={isDark}
          />
        )}

        {filteredYesterday.length > 0 && (
          <AlertSection
            title="Yesterday"
            alerts={filteredYesterday}
            colors={colors}
            isDark={isDark}
          />
        )}

        {/* EMPTY STATE */}
        {filteredToday.length === 0 &&
          filteredYesterday.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={30}
                  color="#7C3AED"
                />
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
              >
                No alerts found
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
                There are no alerts in this
                category.
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

function AlertSection({
  title,
  alerts,
  colors,
  isDark,
}: {
  title: string;
  alerts: AlertItem[];
  colors: {
    background: string;
    card: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    timeText: string;
    filterText: string;
    selectedFilterText: string;
    navIcon: string;
  };
  isDark: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.primaryText,
          },
        ]}
      >
        {title}
      </Text>

      {alerts.map((alert, index) => {
        const alertStyle =
          alertColors[alert.type];

        return (
          <Pressable
            key={`${alert.title}-${index}`}
            style={({ pressed }) => [
              styles.alertCard,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
              pressed &&
                styles.alertCardPressed,
            ]}
          >
            {/* ICON */}
            <View
              style={[
                styles.alertIconContainer,
                {
                  backgroundColor: isDark
                    ? alertStyle.darkBackground
                    : alertStyle.lightBackground,
                },
              ]}
            >
              <Ionicons
                name={alert.icon}
                size={23}
                color={alertStyle.primary}
              />
            </View>

            {/* CONTENT */}
            <View style={styles.alertContent}>
              <Text
                style={[
                  styles.alertTitle,
                  {
                    color:
                      colors.primaryText,
                  },
                ]}
                numberOfLines={1}
              >
                {alert.title}
              </Text>

              <Text
                style={[
                  styles.alertDescription,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
                numberOfLines={1}
              >
                {alert.description}
              </Text>
            </View>

            {/* TIME */}
            <Text
              style={[
                styles.alertTime,
                {
                  color: colors.timeText,
                },
              ]}
            >
              {alert.time}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSafeArea: {
    width: '100%',
  },

  /* HEADER */

  header: {
    height: 52,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerSide: {
    width: 40,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
  },

  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* FILTERS */

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 8,
    marginTop: 3,
    marginBottom: 5,
  },

  filterPill: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterPillSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* LIST */

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },

  section: {
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 13,
    marginBottom: 10,
  },

  /* ALERT CARD */

  alertCard: {
    height: 78,
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertCardPressed: {
    opacity: 0.72,
  },

  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  alertContent: {
    flex: 1,
    paddingRight: 5,
  },

  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  alertDescription: {
    fontSize: 12.5,
  },

  alertTime: {
    fontSize: 11,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor:
      'rgba(124, 58, 237, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
});