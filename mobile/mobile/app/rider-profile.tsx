import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function RiderProfile() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Rider');

  // ================= THEME =================

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor(
    {},
    'textSecondary'
  );
  const mutedTextColor = useThemeColor(
    {},
    'textMuted'
  );
  const cyanColor = useThemeColor({}, 'cyan');
  const purpleColor = useThemeColor({}, 'tint');

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
          Rider Profile
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
            ...(isWeb ? { paddingTop: 12 } : {}),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= PROFILE ================= */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: cardColor,
              borderColor,
              ...(isWeb
                ? {
                    height: 240,
                    paddingVertical: 10,
                  }
                : {}),
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  'rgba(0, 229, 255, 0.09)',
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={40}
              color={cyanColor}
            />
          </View>

          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder="Enter your name"
              placeholderTextColor={mutedTextColor}
              style={[
                styles.nameInput,
                {
                  color: textColor,
                  borderColor: purpleColor,
                },
              ]}
            />
          ) : (
            <Text
              style={[
                styles.riderName,
                {
                  color: textColor,
                },
              ]}
            >
              {name}
            </Text>
          )}

          <Text
            style={[
              styles.riderSubtitle,
              {
                color: secondaryTextColor,
              },
            ]}
          >
            MotoSense Rider
          </Text>

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                borderColor: purpleColor,
                backgroundColor: isEditing
                  ? 'rgba(124, 58, 237, 0.10)'
                  : 'transparent',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={
                isEditing
                  ? 'checkmark-outline'
                  : 'create-outline'
              }
              size={17}
              color={purpleColor}
            />

            <Text
              style={[
                styles.editButtonText,
                {
                  color: purpleColor,
                },
              ]}
            >
              {isEditing
                ? 'Save Profile'
                : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= RIDER INFORMATION ================= */}

        <Text
          style={[
            styles.sectionLabel,
            {
              color: mutedTextColor,
            },
          ]}
        >
          RIDER INFORMATION
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
          {/* NAME */}

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
                name="person-outline"
                size={19}
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
                NAME
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                {name}
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

          {/* RIDER ID */}

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
                name="card-outline"
                size={19}
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
                RIDER ID
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color: textColor,
                  },
                ]}
              >
                MS-001
              </Text>
            </View>
          </View>
        </View>

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
            styles.bikeCard,
            {
              backgroundColor: cardColor,
              borderColor,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/connected-bike')
          }
        >
          <View
            style={[
              styles.bikeIcon,
              {
                backgroundColor:
                  'rgba(0, 229, 255, 0.09)',
              },
            ]}
          >
            <Ionicons
              name="bicycle-outline"
              size={22}
              color={cyanColor}
            />
          </View>

          <View style={styles.bikeText}>
            <Text
              style={[
                styles.bikeName,
                {
                  color: textColor,
                },
              ]}
            >
              MotoSense Bike
            </Text>

            <Text
              style={[
                styles.bikeSubtitle,
                {
                  color: secondaryTextColor,
                },
              ]}
            >
              Primary bike
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={mutedTextColor}
          />
        </TouchableOpacity>
      </ScrollView>
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

  /* ================= PROFILE ================= */

  profileCard: {
    alignItems: 'center',

    paddingHorizontal: 20,
    paddingVertical: 22,

    borderRadius: 20,

    borderWidth: 1,
  },

  avatar: {
    width: 76,
    height: 76,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  riderName: {
    fontSize: 21,
    fontWeight: '800',
  },

  nameInput: {
    minWidth: 150,

    fontSize: 20,
    fontWeight: '800',

    textAlign: 'center',

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderWidth: 1,
    borderRadius: 10,

    marginBottom: 1,
  },

  riderSubtitle: {
    fontSize: 12,

    marginTop: 4,
  },

  editButton: {
    height: 38,

    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 11,

    borderWidth: 1,

    marginTop: 14,
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: '700',

    marginLeft: 6,
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

  /* ================= INFO ================= */

  infoCard: {
    borderRadius: 18,

    borderWidth: 1,

    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 74,

    paddingHorizontal: 15,
    paddingVertical: 12,

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

  /* ================= BIKE ================= */

  bikeCard: {
    minHeight: 76,

    paddingHorizontal: 15,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 18,

    borderWidth: 1,
  },

  bikeIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  bikeText: {
    flex: 1,
  },

  bikeName: {
    fontSize: 14,
    fontWeight: '700',

    marginBottom: 4,
  },

  bikeSubtitle: {
    fontSize: 11,
  },
});