import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function ConnectedBike() {
  const insets = useSafeAreaInsets();

  // ================= THEME =================

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

  const secondaryTextColor = useThemeColor(
    {},
    'textSecondary'
  );

  const mutedTextColor = useThemeColor(
    {},
    'textMuted'
  );

  const cyanColor = useThemeColor(
    {},
    'cyan'
  );

  const greenColor = useThemeColor(
    {},
    'green'
  );

  const purpleColor = useThemeColor(
    {},
    'tint'
  );

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor,
        },
      ]}
    >
      <StatusBar
        style={
          backgroundColor === '#0A0F1A'
            ? 'light'
            : 'dark'
        }
      />

      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          {
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
          Connected Bike
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 40 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= CONNECTION STATUS ================= */}

        <View
          style={[
            styles.connectionCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.connectionIcon,
              {
                backgroundColor:
                  'rgba(0, 255, 157, 0.09)',
              },
            ]}
          >
            <Ionicons
              name="bicycle-outline"
              size={32}
              color={greenColor}
            />
          </View>

          <View style={styles.connectionText}>
            <View style={styles.connectionTitleRow}>
              <Text
                style={[
                  styles.connectionTitle,
                  {
                    color: textColor,
                  },
                ]}
              >
                MotoSense Bike
              </Text>

              <View
                style={[
                  styles.connectedBadge,
                  {
                    backgroundColor:
                      'rgba(0, 255, 157, 0.09)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        greenColor,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.connectedText,
                    {
                      color: greenColor,
                    },
                  ]}
                >
                  Connected
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.connectionDescription,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              Your MotoSense safety system is connected and ready.
            </Text>
          </View>
        </View>

        {/* ================= DEVICE ================= */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          DEVICE
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
          {/* DEVICE NAME */}

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor:
                    'rgba(0, 229, 255, 0.09)',
                },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={20}
                color={cyanColor}
              />
            </View>

            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedTextColor,
                  },
                ]}
              >
                DEVICE
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                MotoSense AI Unit
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* DEVICE ID */}

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor:
                    'rgba(124, 58, 237, 0.11)',
                },
              ]}
            >
              <Ionicons
                name="barcode-outline"
                size={20}
                color={purpleColor}
              />
            </View>

            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedTextColor,
                  },
                ]}
              >
                DEVICE ID
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                MS-BIKE-001
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          {/* LAST SYNC */}

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                {
                  backgroundColor:
                    'rgba(0, 229, 255, 0.09)',
                },
              ]}
            >
              <Ionicons
                name="sync-outline"
                size={20}
                color={cyanColor}
              />
            </View>

            <View style={styles.infoText}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: mutedTextColor,
                  },
                ]}
              >
                LAST SYNC
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                Just now
              </Text>
            </View>
          </View>
        </View>

        {/* ================= SAFETY SYSTEM ================= */}

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionSpacing,
            {
              color: mutedTextColor,
            },
          ]}
        >
          SAFETY SYSTEM
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
          <SensorRow
            icon="eye-outline"
            title="Blind Spot Detection"
            status="Active"
            greenColor={greenColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          <SensorRow
            icon="car-outline"
            title="Front Collision Detection"
            status="Active"
            greenColor={greenColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          <SensorRow
            icon="arrow-down-outline"
            title="Rear Collision Detection"
            status="Active"
            greenColor={greenColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: borderColor,
              },
            ]}
          />

          <SensorRow
            icon="warning-outline"
            title="Crash Detection"
            status="Active"
            greenColor={greenColor}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            mutedTextColor={mutedTextColor}
          />
        </View>

        {/* ================= SYSTEM HEALTH ================= */}

        <View
          style={[
            styles.healthCard,
            {
              backgroundColor:
                'rgba(0, 255, 157, 0.05)',
              borderColor:
                'rgba(0, 255, 157, 0.18)',
            },
          ]}
        >
          <View
            style={[
              styles.healthIcon,
              {
                backgroundColor:
                  'rgba(0, 255, 157, 0.09)',
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={greenColor}
            />
          </View>

          <View style={styles.healthText}>
            <Text
              style={[
                styles.healthTitle,
                {
                  color: textColor,
                },
              ]}
            >
              System healthy
            </Text>

            <Text
              style={[
                styles.healthDescription,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              All connected safety systems are currently operational.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ========================================================= */
/* SENSOR ROW */
/* ========================================================= */

type SensorRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: string;
  greenColor: string;
  textColor: string;
  secondaryTextColor: string;
  mutedTextColor: string;
};

function SensorRow({
  icon,
  title,
  status,
  greenColor,
  textColor,
  secondaryTextColor,
  mutedTextColor,
}: SensorRowProps) {
  return (
    <View style={styles.sensorRow}>
      <View
        style={[
          styles.sensorIcon,
          {
            backgroundColor:
              'rgba(0, 229, 255, 0.09)',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={greenColor}
        />
      </View>

      <View style={styles.sensorText}>
        <Text
          style={[
            styles.sensorTitle,
            {
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.sensorDescription,
            {
              color: secondaryTextColor,
            },
          ]}
        >
          Safety feature enabled
        </Text>
      </View>

      <View style={styles.sensorStatus}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: greenColor,
            },
          ]}
        />

        <Text
          style={[
            styles.sensorStatusText,
            {
              color: greenColor,
            },
          ]}
        >
          {status}
        </Text>
      </View>
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
    width: '100%',

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',

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

  /* ================= CONNECTION ================= */

  connectionCard: {
    minHeight: 108,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 20,

    borderWidth: 1,
  },

  connectionIcon: {
    width: 58,
    height: 58,

    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  connectionText: {
    flex: 1,
  },

  connectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    flexWrap: 'wrap',
  },

  connectionTitle: {
    fontSize: 16,
    fontWeight: '800',

    marginRight: 8,
  },

  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 8,
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 5,
  },

  connectedText: {
    fontSize: 9,
    fontWeight: '800',
  },

  connectionDescription: {
    fontSize: 11,

    lineHeight: 16,

    marginTop: 7,
  },

  /* ================= SECTION ================= */

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',

    letterSpacing: 1.2,

    marginTop: 24,
    marginBottom: 9,
  },

  sectionSpacing: {
    marginTop: 24,
  },

  /* ================= INFO CARD ================= */

  infoCard: {
    borderRadius: 18,

    borderWidth: 1,

    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 72,

    paddingHorizontal: 15,
    paddingVertical: 11,

    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '700',

    letterSpacing: 0.9,

    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  divider: {
    height: 1,

    marginLeft: 70,
  },

  /* ================= SENSOR ================= */

  sensorRow: {
    minHeight: 70,

    paddingHorizontal: 15,
    paddingVertical: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },

  sensorIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  sensorText: {
    flex: 1,

    marginRight: 8,
  },

  sensorTitle: {
    fontSize: 13,
    fontWeight: '700',

    marginBottom: 3,
  },

  sensorDescription: {
    fontSize: 10,
  },

  sensorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sensorStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  /* ================= HEALTH ================= */

  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 18,

    padding: 15,

    borderRadius: 17,

    borderWidth: 1,
  },

  healthIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  healthText: {
    flex: 1,
  },

  healthTitle: {
    fontSize: 13,
    fontWeight: '700',

    marginBottom: 3,
  },

  healthDescription: {
    fontSize: 10.5,

    lineHeight: 15,
  },
});