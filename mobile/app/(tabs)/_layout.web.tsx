import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Slot, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

type NavItem = {
  label: string;
  icon: IconName;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: 'home',
    route: '/(tabs)',
  },
  {
    label: 'Dashboard',
    icon: 'stats-chart',
    route: '/(tabs)/dashboard',
  },
  {
    label: 'Alerts',
    icon: 'notifications',
    route: '/(tabs)/alerts',
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: '/(tabs)/settings',
  },
];

export default function WebLayout() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (
      route === '/(tabs)' ||
      route === '/'
    ) {
      return (
        pathname === '/' ||
        pathname === '/(tabs)'
      );
    }

    return pathname.startsWith(
      route.replace('/(tabs)', '')
    );
  };

  const goTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.root}>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <View style={styles.sidebar}>

        {/* ================= BRAND ================= */}

        <View style={styles.brandSection}>

          <View style={styles.logoBox}>
            <Ionicons
              name="bicycle"
              size={27}
              color="#00E5FF"
            />
          </View>

          <View style={styles.brandTextContainer}>
            <Text style={styles.brandText}>
              MOTOSENSE
            </Text>

            <Text style={styles.brandAI}>
              AI
            </Text>
          </View>

        </View>

        {/* DIVIDER */}

        <View style={styles.divider} />

        {/* ================= NAVIGATION ================= */}

        <View style={styles.navigation}>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.route);

            return (
              <Pressable
                key={item.label}
                onPress={() => goTo(item.route)}
                style={[
                  styles.navItem,
                  active && styles.navItemActive,
                ]}
              >

                <View
                  style={[
                    styles.navIconBox,
                    active &&
                      styles.navIconBoxActive,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={
                      active
                        ? '#7C3AED'
                        : '#8A98B3'
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.navLabel,
                    active &&
                      styles.navLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>

              </Pressable>
            );
          })}

        </View>

        {/* ================= CONNECTED BIKE ================= */}

        <View style={styles.connectionSection}>

          <View style={styles.connectionCard}>

            <View style={styles.connectionDot} />

            <Text style={styles.connectionTitle}>
              Bike
            </Text>

            <Text style={styles.connectionTitle}>
              Connected
            </Text>

            <Text style={styles.connectionSubtitle}>
              Last synced
            </Text>

            <Text style={styles.connectionSubtitle}>
              just now
            </Text>

          </View>

        </View>

      </View>

      {/* =====================================================
          MAIN WEB CONTENT
      ===================================================== */}

      <View style={styles.mainContent}>
        <Slot />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  /* =====================================================
     ROOT
  ===================================================== */

  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,

    flexDirection: 'row',

    backgroundColor: '#080D18',
  },

  /* =====================================================
     SIDEBAR
  ===================================================== */

  sidebar: {
    position: 'fixed' as any,

    left: 0,
    top: 0,
    bottom: 0,

    width: 125,

    backgroundColor: '#0A0F1A',

    borderRightWidth: 1,
    borderRightColor: '#1C2333',

    zIndex: 100,

    flexDirection: 'column',

    alignItems: 'center',
  },

  /* =====================================================
     BRAND
  ===================================================== */

  brandSection: {
    height: 120,

    width: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBox: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor:
      'rgba(124, 58, 237, 0.16)',

    borderWidth: 1,
    borderColor:
      'rgba(124, 58, 237, 0.30)',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,
  },

  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },

  brandText: {
    color: '#F6F8FC',

    fontSize: 10,
    fontWeight: '900',

    letterSpacing: 0.2,
  },

  brandAI: {
    color: '#00E5FF',

    fontSize: 10,
    fontWeight: '900',

    marginLeft: 2,
  },

  divider: {
    height: 1,

    backgroundColor: '#1C2333',

    width: '100%',
  },

  /* =====================================================
     NAVIGATION
  ===================================================== */

  navigation: {
    width: '100%',

    paddingHorizontal: 10,
    paddingTop: 18,
  },

  navItem: {
    height: 70,

    width: '100%',

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,
  },

  navItemActive: {
    backgroundColor:
      'rgba(124, 58, 237, 0.18)',
  },

  navIconBox: {
    width: 38,
    height: 38,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 3,
  },

  navIconBoxActive: {
    backgroundColor:
      'rgba(124, 58, 237, 0.14)',
  },

  navLabel: {
    color: '#8A98B3',

    fontSize: 10,
    fontWeight: '600',

    textAlign: 'center',
  },

  navLabelActive: {
    color: '#F6F8FC',

    fontWeight: '700',
  },

  /* =====================================================
     CONNECTION
  ===================================================== */

  connectionSection: {
    marginTop: 'auto',

    width: '100%',

    paddingHorizontal: 10,
    paddingBottom: 18,
  },

  connectionCard: {
    borderTopWidth: 1,
    borderTopColor: '#1C2333',

    paddingTop: 14,

    alignItems: 'center',
  },

  connectionDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: '#00FF9D',

    marginBottom: 6,
  },

  connectionTitle: {
    color: '#F6F8FC',

    fontSize: 10,
    fontWeight: '700',

    textAlign: 'center',

    lineHeight: 13,
  },

  connectionSubtitle: {
    color: '#71809A',

    fontSize: 8,

    marginTop: 2,

    textAlign: 'center',
  },

  /* =====================================================
     MAIN CONTENT
  ===================================================== */

  mainContent: {
    flex: 1,

    width: '100%',
    height: '100%',

    minHeight: 0,

    marginLeft: 125,

    overflow: 'hidden',
  },
});