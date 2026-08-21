import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

type AlertType =
  | 'critical'
  | 'warning'
  | 'system'
  | 'ride';

const alertConfig = {
  critical: {
    color: '#FF4D4D',
    background: 'rgba(255, 77, 77, 0.10)',
    label: 'CRITICAL ALERT',
    icon: 'alert-circle-outline' as const,
  },

  warning: {
    color: '#FFB800',
    background: 'rgba(255, 184, 0, 0.10)',
    label: 'SAFETY WARNING',
    icon: 'warning-outline' as const,
  },

  system: {
    color: '#00FF9D',
    background: 'rgba(0, 255, 157, 0.10)',
    label: 'SYSTEM',
    icon: 'checkmark-circle-outline' as const,
  },

  ride: {
    color: '#00E5FF',
    background: 'rgba(0, 229, 255, 0.10)',
    label: 'RIDE UPDATE',
    icon: 'navigate-outline' as const,
  },
};

export default function AlertDetails() {
  const params = useLocalSearchParams<{
    type?: string;
    title?: string;
    description?: string;
    time?: string;
    icon?: string;
  }>();

  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor(
    {},
    'background'
  );

  const cardColor = useThemeColor(
    {},
    'card'
  );

  const borderColor = useThemeColor(
    {},
    'border'
  );

  const textColor = useThemeColor(
    {},
    'text'
  );

  const secondaryTextColor =
    useThemeColor({}, 'textSecondary');

  const mutedTextColor =
    useThemeColor({}, 'textMuted');

  const isDark =
    backgroundColor === '#0A0F1A';

  const type: AlertType =
    params.type === 'critical' ||
    params.type === 'warning' ||
    params.type === 'system' ||
    params.type === 'ride'
      ? params.type
      : 'system';

  const config = alertConfig[type];

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
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={backgroundColor}
      />

      {/* SAFE AREA */}
      <View
        style={[
          styles.topSafeArea,
          {
            height: insets.top,
            backgroundColor,
          },
        ]}
      />

      {/* HEADER */}
      <View style={styles.header}>
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
          <Ionicons
            name="arrow-back"
            size={23}
            color={textColor}
          />
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color: textColor,
            },
          ]}
        >
          Alert Details
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
      >
        {/* ALERT HERO */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor:
                  config.background,
              },
            ]}
          >
            <Ionicons
              name={config.icon}
              size={34}
              color={config.color}
            />
          </View>

          <Text
            style={[
              styles.alertLabel,
              {
                color: config.color,
              },
            ]}
          >
            {config.label}
          </Text>

          <Text
            style={[
              styles.alertTitle,
              {
                color: textColor,
              },
            ]}
          >
            {params.title || 'Alert'}
          </Text>

          <Text
            style={[
              styles.alertDescription,
              {
                color: secondaryTextColor,
              },
            ]}
          >
            {params.description ||
              'No additional information available.'}
          </Text>

          <View
            style={[
              styles.timeContainer,
              {
                borderTopColor: borderColor,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={mutedTextColor}
            />

            <Text
              style={[
                styles.timeText,
                {
                  color: mutedTextColor,
                },
              ]}
            >
              {params.time || 'Recently'}
            </Text>
          </View>
        </View>

        {/* EVENT INFORMATION */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: textColor,
            },
          ]}
        >
          Event Information
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          <InfoRow
            icon="shield-checkmark-outline"
            label="Safety System"
            value="MotoSense AI"
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            borderColor={borderColor}
          />

          <InfoRow
            icon="radio-outline"
            label="Status"
            value={
              type === 'critical'
                ? 'Action Required'
                : type === 'warning'
                ? 'Warning Detected'
                : 'Recorded'
            }
            valueColor={config.color}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            borderColor={borderColor}
          />

          <InfoRow
            icon="calendar-outline"
            label="Date"
            value="Today"
            textColor={textColor}
            mutedTextColor={mutedTextColor}
            borderColor={borderColor}
            isLast
          />
        </View>

        {/* CRITICAL RESPONSE */}
        {type === 'critical' && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                },
              ]}
            >
              Safety Response
            </Text>

            <View
              style={[
                styles.responseCard,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
              ]}
            >
              <ResponseRow
                icon="alert-circle-outline"
                text="Crash event detected"
                color={config.color}
              />

              <ResponseRow
                icon="notifications-outline"
                text="SOS notification triggered"
                color={config.color}
              />

              <ResponseRow
                icon="people-outline"
                text="Emergency contacts notified"
                color={config.color}
              />
            </View>
          </>
        )}

        {/* WARNING INFO */}
        {type === 'warning' && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                },
              ]}
            >
              Recommended Action
            </Text>

            <View
              style={[
                styles.actionCard,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      config.background,
                  },
                ]}
              >
                <Ionicons
                  name="shield-outline"
                  size={22}
                  color={config.color}
                />
              </View>

              <View
                style={styles.actionContent}
              >
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  Stay alert
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color:
                        secondaryTextColor,
                    },
                  ]}
                >
                  Maintain awareness of nearby
                  vehicles and road conditions.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* SYSTEM */}
        {type === 'system' && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                },
              ]}
            >
              System Status
            </Text>

            <View
              style={[
                styles.systemCard,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={config.color}
              />

              <Text
                style={[
                  styles.systemText,
                  {
                    color: textColor,
                  },
                ]}
              >
                All MotoSense safety systems are
                operating normally.
              </Text>
            </View>
          </>
        )}

        {/* RIDE */}
        {type === 'ride' && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                },
              ]}
            >
              Ride Information
            </Text>

            <View
              style={[
                styles.systemCard,
                {
                  backgroundColor: cardColor,
                  borderColor,
                },
              ]}
            >
              <Ionicons
                name="navigate-circle-outline"
                size={24}
                color={config.color}
              />

              <Text
                style={[
                  styles.systemText,
                  {
                    color: textColor,
                  },
                ]}
              >
                Your ride tracking session has
                started successfully.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  textColor,
  mutedTextColor,
  borderColor,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && {
          borderBottomColor:
            borderColor,
          borderBottomWidth: 1,
        },
      ]}
    >
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={19}
          color={mutedTextColor}
        />

        <Text
          style={[
            styles.infoLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.infoValue,
          {
            color:
              valueColor || textColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ResponseRow({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.responseRow}>
      <Ionicons
        name={icon}
        size={20}
        color={color}
      />

      <Text style={styles.responseText}>
        {text}
      </Text>
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
    height: 58,

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 14,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  headerSpacer: {
    width: 42,
  },

  /* CONTENT */

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  /* HERO */

  heroCard: {
    borderRadius: 20,
    borderWidth: 1,

    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,

    alignItems: 'center',
  },

  heroIcon: {
    width: 72,
    height: 72,

    borderRadius: 23,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 14,
  },

  alertLabel: {
    fontSize: 10,
    fontWeight: '800',

    letterSpacing: 1.2,

    marginBottom: 7,
  },

  alertTitle: {
    fontSize: 22,
    fontWeight: '800',

    textAlign: 'center',

    marginBottom: 8,
  },

  alertDescription: {
    fontSize: 13,

    lineHeight: 19,

    textAlign: 'center',

    maxWidth: 300,
  },

  timeContainer: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderTopWidth: 1,

    marginTop: 18,
    paddingTop: 13,
  },

  timeText: {
    fontSize: 11,

    marginLeft: 6,
  },

  /* SECTIONS */

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',

    marginTop: 22,
    marginBottom: 10,
  },

  /* INFO */

  infoCard: {
    borderRadius: 17,
    borderWidth: 1,

    paddingHorizontal: 15,
  },

  infoRow: {
    minHeight: 56,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 12,

    marginLeft: 10,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* RESPONSE */

  responseCard: {
    borderRadius: 17,
    borderWidth: 1,

    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  responseRow: {
    minHeight: 50,

    flexDirection: 'row',
    alignItems: 'center',
  },

  responseText: {
    color: '#8F98AA',

    fontSize: 12.5,

    marginLeft: 11,
  },

  /* ACTION */

  actionCard: {
    borderRadius: 17,
    borderWidth: 1,

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',

    marginBottom: 4,
  },

  actionDescription: {
    fontSize: 12,

    lineHeight: 17,
  },

  /* SYSTEM / RIDE */

  systemCard: {
    borderRadius: 17,
    borderWidth: 1,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',
  },

  systemText: {
    flex: 1,

    fontSize: 12.5,

    lineHeight: 18,

    marginLeft: 12,
  },
});