import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Location from 'expo-location';

import MapView, {
  Marker,
  Polyline,
  Region,
} from 'react-native-maps';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';

/* ============================================================
   TYPES
============================================================ */

type IconName =
  React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type NearbyPlaceProps = {
  icon: IconName;
  iconColor: string;
  backgroundColor: string;
  title: string;
  distance: string;
};

/* ============================================================
   DARK MAP STYLE
============================================================ */

const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0B1726' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#71839B' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#07101E' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#1B2B40' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#17263A' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#22344C' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1D3047' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#29415D' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#071421' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0E1C2D' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#15263A' }],
  },
];

/* ============================================================
   MAIN NAVIGATION SCREEN
============================================================ */

export default function NavigationScreen() {
  const mapRef = useRef<MapView>(null);

  const locationSubscription =
    useRef<Location.LocationSubscription | null>(null);

  const headingSubscription =
    useRef<Location.LocationSubscription | null>(null);

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [heading, setHeading] = useState(0);

  /* ============================================================
     START GPS TRACKING
  ============================================================ */

  useEffect(() => {
    startLocationTracking();

    return () => {
      locationSubscription.current?.remove();
      headingSubscription.current?.remove();
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      /* Request location permission */

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'MotoSense needs your location to provide live navigation.'
        );

        return;
      }

      /* Get initial location */

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);

      /* Watch GPS position */

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            distanceInterval: 3,

            timeInterval: 1000,
          },

          (newLocation) => {
            setLocation(newLocation);

            if (
              newLocation.coords.heading !== null &&
              newLocation.coords.heading >= 0
            ) {
              setHeading(newLocation.coords.heading);
            }
          }
        );

      /* Watch compass heading */

      headingSubscription.current =
        await Location.watchHeadingAsync(
          (headingData) => {
            if (headingData.trueHeading >= 0) {
              setHeading(headingData.trueHeading);
            } else {
              setHeading(headingData.magHeading);
            }
          }
        );
    } catch (error) {
      console.log('GPS error:', error);

      Alert.alert(
        'Location Error',
        'Unable to get your current location.'
      );
    }
  };

  /* ============================================================
     CENTER MAP ON RIDER
  ============================================================ */

  const centerOnLocation = () => {
    if (!location) {
      return;
    }

    const { latitude, longitude } =
      location.coords;

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,

        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },

      500
    );
  };

  /* ============================================================
     LOADING SCREEN
  ============================================================ */

  if (!location) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingIcon}>
          <MaterialCommunityIcons
            name="navigation-variant"
            size={30}
            color="#55BFFF"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Getting your location
        </Text>

        <Text style={styles.loadingSubtitle}>
          Preparing live navigation...
        </Text>
      </View>
    );
  }

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const {
    latitude,
    longitude,
  } = location.coords;

  const initialRegion: Region = {
    latitude,
    longitude,

    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  /* ============================================================
     TEMPORARY DEMO ROUTE
     
     IMPORTANT:
     This is only temporary.

     Later we will replace this with a REAL route returned
     from a navigation/routing API.
  ============================================================ */

  const demoRoute = [
    {
      latitude: latitude - 0.0025,
      longitude: longitude - 0.0010,
    },

    {
      latitude: latitude - 0.0013,
      longitude: longitude - 0.0007,
    },

    {
      latitude: latitude + 0.0002,
      longitude: longitude - 0.0002,
    },

    {
      latitude: latitude + 0.0018,
      longitude: longitude + 0.0008,
    },

    {
      latitude: latitude + 0.0034,
      longitude: longitude + 0.0012,
    },
  ];

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <View style={styles.container}>

      {/* ======================================================
          REAL MAP
      ====================================================== */}

      <MapView
        ref={mapRef}
        style={styles.map}

        initialRegion={initialRegion}

        customMapStyle={DARK_MAP_STYLE}

        showsCompass={false}

        showsUserLocation={false}

        showsMyLocationButton={false}

        showsTraffic={false}

        toolbarEnabled={
          Platform.OS === 'android'
        }
      >

        {/* ====================================================
            BLUE NAVIGATION ROUTE
        ==================================================== */}

        <Polyline
          coordinates={demoRoute}

          strokeColor="#38AFFF"

          strokeWidth={6}

          lineCap="round"

          lineJoin="round"
        />

        {/* ====================================================
            CUSTOM RIDER LOCATION
        ==================================================== */}

        <Marker
          coordinate={{
            latitude,
            longitude,
          }}

          anchor={{
            x: 0.5,
            y: 0.5,
          }}

          flat

          rotation={heading}
        >
          <View style={styles.riderOuter}>

            <View style={styles.riderInner}>

              <MaterialCommunityIcons
                name="navigation"
                size={42}
                color="#FFFFFF"
              />

            </View>

          </View>
        </Marker>

      </MapView>

      {/* ======================================================
          TOP HEADER + TURN CARD
      ====================================================== */}

      <SafeAreaView
        style={styles.topArea}
        pointerEvents="box-none"
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#F5F7FA"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            NAVIGATION
          </Text>

          <View
            style={styles.headerRightSpace}
          />

        </View>

        {/* ====================================================
            TURN INSTRUCTION CARD
        ==================================================== */}

        <View style={styles.instructionCard}>

          <View style={styles.turnSection}>

            <MaterialCommunityIcons
              name="arrow-top-right"
              size={62}
              color="#8FD8FF"
            />

            <View style={styles.turnText}>

              <Text style={styles.distance}>
                700
                <Text
                  style={styles.distanceUnit}
                >
                  {' '}m
                </Text>
              </Text>

              <Text style={styles.turnDirection}>
                Turn Right
              </Text>

            </View>

          </View>

          {/* Divider */}

          <View
            style={styles.instructionDivider}
          />

          {/* ETA */}

          <View style={styles.etaSection}>

            <Text style={styles.etaLabel}>
              ETA
            </Text>

            <Text style={styles.etaValue}>
              10:42 PM
            </Text>

            <Text style={styles.timeValue}>
              12 min
            </Text>

            <Text style={styles.distanceValue}>
              5.4 km
            </Text>

          </View>

          {/* Road */}

          <Text style={styles.roadName}>
            Outer Ring Road
          </Text>

        </View>

      </SafeAreaView>

      {/* ======================================================
          RIGHT MAP CONTROLS
      ====================================================== */}

      <View style={styles.mapControls}>

        {/* Sound */}

        <TouchableOpacity
          style={styles.mapControl}
        >
          <Ionicons
            name="volume-high-outline"
            size={27}
            color="#F5F7FA"
          />
        </TouchableOpacity>

        {/* Layers */}

        <TouchableOpacity
          style={styles.mapControl}
        >
          <MaterialCommunityIcons
            name="layers-outline"
            size={29}
            color="#F5F7FA"
          />
        </TouchableOpacity>

        {/* Current location */}

        <TouchableOpacity
          style={styles.mapControl}
          onPress={centerOnLocation}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={28}
            color="#F5F7FA"
          />
        </TouchableOpacity>

      </View>

      {/* ======================================================
          NEARBY PLACES
      ====================================================== */}

      <View style={styles.nearbyCard}>

        <Text style={styles.nearbyTitle}>
          NEARBY PLACES
        </Text>

        <View style={styles.nearbyRow}>

          <NearbyPlace
            icon="gas-station"
            iconColor="#38E5E8"
            backgroundColor="#063F46"
            title="Fuel Pump"
            distance="1.2 km"
          />

          <NearbyPlace
            icon="parking"
            iconColor="#20A9FF"
            backgroundColor="#063B67"
            title="Parking"
            distance="2.1 km"
          />

          <NearbyPlace
            icon="hospital-box"
            iconColor="#FF6A6A"
            backgroundColor="#5A252B"
            title="Hospital"
            distance="3.8 km"
          />

          <NearbyPlace
            icon="silverware-fork-knife"
            iconColor="#FF7B39"
            backgroundColor="#5B2C1A"
            title="Food"
            distance="4.2 km"
          />

        </View>

      </View>

      {/* ======================================================
          END RIDE
      ====================================================== */}

      <TouchableOpacity
        style={styles.endRideButton}
      >

        <View style={styles.endRideCircle}>

          <Ionicons
            name="close"
            size={29}
            color="#FFFFFF"
          />

        </View>

        <Text style={styles.endRideText}>
          End Ride
        </Text>

      </TouchableOpacity>

    </View>
  );
}

/* ============================================================
   NEARBY PLACE COMPONENT
============================================================ */

function NearbyPlace({
  icon,
  iconColor,
  backgroundColor,
  title,
  distance,
}: NearbyPlaceProps) {

  return (
    <View style={styles.nearbyItem}>

      <View
        style={[
          styles.nearbyIcon,
          {
            backgroundColor,
          },
        ]}
      >

        <MaterialCommunityIcons
          name={icon}
          size={25}
          color={iconColor}
        />

      </View>

      <Text style={styles.nearbyName}>
        {title}
      </Text>

      <Text style={styles.nearbyDistance}>
        {distance}
      </Text>

    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ==========================================================
     MAIN
  ========================================================== */

  container: {
    flex: 1,
    backgroundColor: '#07101E',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  loading: {
    flex: 1,

    backgroundColor: '#07101E',

    justifyContent: 'center',

    alignItems: 'center',
  },

  loadingIcon: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: '#10243A',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 18,
  },

  loadingTitle: {
    color: '#F5F7FA',

    fontSize: 20,

    fontWeight: '700',
  },

  loadingSubtitle: {
    color: '#7D8EA5',

    fontSize: 14,

    marginTop: 8,
  },

  /* ==========================================================
     TOP AREA
  ========================================================== */

  topArea: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    height: 86,

    paddingHorizontal: 22,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,

    justifyContent: 'center',

    alignItems: 'center',
  },

  headerTitle: {
    color: '#F5F7FA',

    fontSize: 22,

    fontWeight: '800',

    letterSpacing: 0.5,
  },

  headerRightSpace: {
    width: 42,
  },

  /* ==========================================================
     TURN CARD
  ========================================================== */

  instructionCard: {
    marginHorizontal: 18,

    minHeight: 228,

    borderRadius: 24,

    backgroundColor:
      'rgba(9, 20, 35, 0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(56, 79, 108, 0.55)',

    paddingHorizontal: 25,

    paddingTop: 27,
  },

  turnSection: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  turnText: {
    marginLeft: 14,
  },

  distance: {
    color: '#F5F7FA',

    fontSize: 45,

    fontWeight: '500',

    lineHeight: 48,
  },

  distanceUnit: {
    fontSize: 28,

    fontWeight: '400',
  },

  turnDirection: {
    color: '#F5F7FA',

    fontSize: 23,

    fontWeight: '500',

    marginTop: 3,
  },

  instructionDivider: {
    position: 'absolute',

    right: 118,

    top: 38,

    bottom: 32,

    width: 1,

    backgroundColor: '#28384E',
  },

  etaSection: {
    position: 'absolute',

    right: 22,

    top: 31,

    width: 95,

    alignItems: 'center',
  },

  etaLabel: {
    color: '#8A98AA',

    fontSize: 16,

    fontWeight: '600',
  },

  etaValue: {
    color: '#F5F7FA',

    fontSize: 17,

    fontWeight: '600',

    marginTop: 8,
  },

  timeValue: {
    color: '#F5F7FA',

    fontSize: 18,

    fontWeight: '700',

    marginTop: 23,
  },

  distanceValue: {
    color: '#D5DCE5',

    fontSize: 16,

    marginTop: 4,
  },

  roadName: {
    position: 'absolute',

    left: 25,

    bottom: 24,

    color: '#F5F7FA',

    fontSize: 18,

    fontWeight: '600',
  },

  /* ==========================================================
     RIDER MARKER
  ========================================================== */

  riderOuter: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor:
      'rgba(16, 103, 235, 0.55)',

    justifyContent: 'center',

    alignItems: 'center',

    shadowColor: '#1688FF',

    shadowOpacity: 0.65,

    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  riderInner: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: '#0868D9',

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#3BA8FF',
  },

  /* ==========================================================
     MAP CONTROLS
  ========================================================== */

  mapControls: {
    position: 'absolute',

    right: 20,

    top: '51%',

    gap: 12,
  },

  mapControl: {
    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor:
      'rgba(7, 16, 30, 0.88)',

    borderWidth: 1,

    borderColor: '#26384E',

    justifyContent: 'center',

    alignItems: 'center',
  },

  /* ==========================================================
     NEARBY PLACES
  ========================================================== */

  nearbyCard: {
    position: 'absolute',

    left: 18,
    right: 18,

    bottom: 165,

    height: 198,

    borderRadius: 25,

    backgroundColor:
      'rgba(9, 20, 35, 0.96)',

    borderWidth: 1,

    borderColor:
      'rgba(46, 67, 91, 0.7)',

    paddingHorizontal: 26,

    paddingTop: 28,
  },

  nearbyTitle: {
    color: '#F5F7FA',

    fontSize: 17,

    fontWeight: '800',

    letterSpacing: 0.3,
  },

  nearbyRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginTop: 23,
  },

  nearbyItem: {
    alignItems: 'center',

    width: '23%',
  },

  nearbyIcon: {
    width: 58,
    height: 58,

    borderRadius: 29,

    justifyContent: 'center',

    alignItems: 'center',
  },

  nearbyName: {
    color: '#E9EDF3',

    fontSize: 13,

    fontWeight: '600',

    marginTop: 10,

    textAlign: 'center',
  },

  nearbyDistance: {
    color: '#B9C3CF',

    fontSize: 14,

    marginTop: 7,
  },

  /* ==========================================================
     END RIDE
  ========================================================== */

  endRideButton: {
    position: 'absolute',

    left: 20,
    right: 20,

    bottom: 25,

    height: 82,

    borderRadius: 42,

    backgroundColor:
      'rgba(24, 36, 53, 0.97)',

    borderWidth: 1,

    borderColor: '#3A4B62',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  endRideCircle: {
    position: 'absolute',

    left: 17,

    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: '#172435',

    borderWidth: 1,

    borderColor: '#42536A',

    justifyContent: 'center',

    alignItems: 'center',
  },

  endRideText: {
    color: '#FF493D',

    fontSize: 18,

    fontWeight: '800',
  },

});