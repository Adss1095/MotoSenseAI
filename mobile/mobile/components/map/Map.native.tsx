/*
 * ============================================================
 * MOTOSENSE AI
 * MOBILE NAVIGATION MAP
 * ============================================================
 *
 * Google Maps
 * +
 * Live GPS
 * +
 * Valhalla Motorcycle Routing
 *
 * ============================================================
 */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';

import * as Location from 'expo-location';

import { router } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { Ionicons } from '@expo/vector-icons';

import { useCurrentLocation } from '@/hooks/useCurrentLocation';

import {
  calculateMotorcycleRoute,
  RouteManeuver,
} from '@/services/routing';

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Coordinate = {
  latitude: number;
  longitude: number;
};

type NearbyProps = {
  icon: string;
  label: string;
  distance: string;
  iconBackground: string;
};

/*
 * ============================================================
 * DARK GOOGLE MAP STYLE
 * ============================================================
 */

const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#071321' }],
  },

  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#71859A' }],
  },

  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#071321' }],
  },

  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#203348' }],
  },

  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#071321' }],
  },

  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0B1B2A' }],
  },

  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#60778B' }],
  },

  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#14283A' }],
  },

  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0B1724' }],
  },

  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#526B80' }],
  },

  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1B344A' }],
  },

  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#03101C' }],
  },
];

/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function MapScreen() {
  const mapRef =
    useRef<MapView>(null);

  /*
   * ----------------------------------------------------------
   * LIVE LOCATION
   * ----------------------------------------------------------
   */

  const {
    coordinate,
    loading,
    error,
  } = useCurrentLocation();

  /*
   * ----------------------------------------------------------
   * MAP REGION
   * ----------------------------------------------------------
   */

  const [region, setRegion] =
    useState<Region>({
      latitude: 12.9716,

      longitude: 77.5946,

      latitudeDelta: 0.04,

      longitudeDelta: 0.04,
    });

  /*
   * ----------------------------------------------------------
   * SEARCH
   * ----------------------------------------------------------
   */

  const [startText, setStartText] =
    useState('');

  const [destinationText, setDestinationText] =
    useState('');

  /*
   * ----------------------------------------------------------
   * LOCATIONS
   * ----------------------------------------------------------
   */

  const [startCoordinate, setStartCoordinate] =
    useState<Coordinate | null>(null);

  const [destinationCoordinate, setDestinationCoordinate] =
    useState<Coordinate | null>(null);

  /*
   * ----------------------------------------------------------
   * ROUTE
   * ----------------------------------------------------------
   */

  const [routeCoordinates, setRouteCoordinates] =
    useState<Coordinate[]>([]);

  const [routeDistance, setRouteDistance] =
    useState(0);

  const [routeMinutes, setRouteMinutes] =
    useState(0);

  const [maneuvers, setManeuvers] =
    useState<RouteManeuver[]>([]);

  /*
   * ----------------------------------------------------------
   * NAVIGATION STATE
   * ----------------------------------------------------------
   */

  const [routeReady, setRouteReady] =
    useState(false);

  const [rideStarted, setRideStarted] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [currentManeuverIndex, setCurrentManeuverIndex] =
    useState(0);

  /*
   * ============================================================
   * KEEP CAMERA ON RIDER DURING RIDE
   * ============================================================
   */

  useEffect(() => {
    if (
      !coordinate ||
      !rideStarted
    ) {
      return;
    }

    mapRef.current?.animateCamera(
      {
        center: {
          latitude:
            coordinate.latitude,

          longitude:
            coordinate.longitude,
        },
      },
      {
        duration: 700,
      },
    );
  }, [
    coordinate,
    rideStarted,
  ]);

  /*
   * ============================================================
   * DESTINATION SEARCH + ROUTING
   * ============================================================
   */

  async function findRoute() {
    Keyboard.dismiss();

    if (!startText.trim()) {
      Alert.alert(
        'Starting location required',
        'Please enter a starting location.',
      );
      return;
    }

    if (!destinationText.trim()) {
      Alert.alert(
        'Destination required',
        'Please enter a destination.',
      );
      return;
    }

    try {
      setSearching(true);

      /*
       * ========================================================
       * GEOCODE START LOCATION
       * ========================================================
       */

      const startResults =
        await Location.geocodeAsync(
          startText.trim(),
        );

      if (!startResults.length) {
        Alert.alert(
          'Starting location not found',
          'Please enter a valid starting location.',
        );
        setSearching(false);
        return;
      }

      /*
       * ========================================================
       * GEOCODE DESTINATION
       * ========================================================
       */

      const destinationResults =
        await Location.geocodeAsync(
          destinationText.trim(),
        );

      if (!destinationResults.length) {
        Alert.alert(
          'Destination not found',
          'Please enter a valid destination.',
        );
        setSearching(false);
        return;
      }

      const resolvedStart = {
        latitude:
          startResults[0].latitude,
        longitude:
          startResults[0].longitude,
      };

      const resolvedDestination = {
        latitude:
          destinationResults[0].latitude,
        longitude:
          destinationResults[0].longitude,
      };

      setStartCoordinate(
        resolvedStart,
      );

      setDestinationCoordinate(
        resolvedDestination,
      );

      /*
       * ========================================================
       * CALCULATE REAL MOTORCYCLE ROUTE
       * ========================================================
       */

      const route =
        await calculateMotorcycleRoute(
          {
            lat:
              resolvedStart.latitude,
            lon:
              resolvedStart.longitude,
          },
          {
            lat:
              resolvedDestination.latitude,
            lon:
              resolvedDestination.longitude,
          },
        );

      setRouteCoordinates(
        route.points,
      );

      setRouteDistance(
        route.distanceKm,
      );

      setRouteMinutes(
        route.durationMinutes,
      );

      setManeuvers(
        route.maneuvers,
      );

      setCurrentManeuverIndex(
        0,
      );

      setRouteReady(true);
      setRideStarted(false);

      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          route.points,
          {
            edgePadding: {
              top: 230,
              right: 60,
              bottom: 300,
              left: 60,
            },
            animated: true,
          },
        );
      }, 300);

      setSearching(false);
    } catch (routeError) {
      console.error(
        'MOTORCYCLE ROUTE ERROR:',
        routeError,
      );

      Alert.alert(
        'Route error',
        routeError instanceof Error
          ? routeError.message
          : 'Unable to calculate the motorcycle route.',
      );

      setSearching(false);
    }
  }

  /*
   * ============================================================
   * START RIDE
   * ============================================================
   */

  function startRide() {
    if (
      !startCoordinate ||
      !destinationCoordinate ||
      !routeCoordinates.length
    ) {
      return;
    }

    setRideStarted(true);

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        routeCoordinates,

        {
          edgePadding: {
            top: 220,

            right: 80,

            bottom: 280,

            left: 80,
          },

          animated: true,
        },
      );
    }, 200);
  }

  /*
   * ============================================================
   * END RIDE
   * ============================================================
   */

  function endRide() {
    setRideStarted(false);

    setRouteReady(false);

    setDestinationCoordinate(
      null,
    );

    setRouteCoordinates([]);

    setManeuvers([]);

    setStartText('');

    setDestinationText('');

    setCurrentManeuverIndex(0);
  }

  /*
   * ============================================================
   * RECENTER
   * ============================================================
   */

  function recenter() {
    if (!coordinate) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude:
          coordinate.latitude,

        longitude:
          coordinate.longitude,

        latitudeDelta: 0.015,

        longitudeDelta: 0.015,
      },
      600,
    );
  }

  /*
   * ============================================================
   * CURRENT MANEUVER
   * ============================================================
   */

  const currentManeuver =
    maneuvers[
      currentManeuverIndex
    ];

  /*
   * ============================================================
   * MANEUVER DISTANCE
   * ============================================================
   */

  const maneuverDistanceText =
    useMemo(() => {
      if (!currentManeuver) {
        return '--';
      }

      const meters =
        Math.round(
          currentManeuver.distanceKm *
            1000,
        );

      if (meters >= 1000) {
        return `${(
          meters / 1000
        ).toFixed(1)} km`;
      }

      return `${meters} m`;
    }, [
      currentManeuver,
    ]);

  /*
   * ============================================================
   * MANEUVER TEXT
   * ============================================================
   */

  const maneuverInstruction =
    currentManeuver?.instruction ||
    'Continue';

  const maneuverRoad =
    currentManeuver?.streetName ||
    'Current Road';

  /*
   * ============================================================
   * ETA CLOCK
   * ============================================================
   */

  const etaTime = new Date(
    Date.now() +
      routeMinutes * 60000,
  ).toLocaleTimeString(
    [],
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <View
      style={styles.container}
    >
      <StatusBar
        style="light"
      />

      {/* ================================================= */}
      {/* GOOGLE MAP */}
      {/* ================================================= */}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={
          StyleSheet.absoluteFillObject
        }
        initialRegion={region}
        customMapStyle={
          DARK_MAP_STYLE
        }
        showsUserLocation
        showsMyLocationButton={
          false
        }
        showsCompass={false}
        showsBuildings
        showsTraffic={false}
        onRegionChangeComplete={
          setRegion
        }
      >
        {/* ================================================= */}
        {/* START MARKER */}
        {/* ================================================= */}

        {startCoordinate && (
          <Marker
            coordinate={
              startCoordinate
            }
            anchor={{
              x: 0.5,
              y: 0.5,
            }}
          >
            <View
              style={
                styles.startMarker
              }
            >
              <View
                style={
                  styles.startMarkerDot
                }
              />
            </View>
          </Marker>
        )}

        {/* ================================================= */}
        {/* DESTINATION MARKER */}
        {/* ================================================= */}

        {destinationCoordinate && (
          <Marker
            coordinate={
              destinationCoordinate
            }
          >
            <View
              style={
                styles.destinationMarker
              }
            >
              <Ionicons
                name="location"
                size={20}
                color="#FFFFFF"
              />
            </View>
          </Marker>
        )}

        {/* ================================================= */}
        {/* REAL MOTORCYCLE ROUTE */}
        {/* ================================================= */}

        {routeReady &&
          routeCoordinates.length >
            1 && (
            <Polyline
              coordinates={
                routeCoordinates
              }
              strokeWidth={6}
              strokeColor="#16C7FF"
              lineCap="round"
              lineJoin="round"
            />
          )}
      </MapView>

      {/* ================================================= */}
      {/* PLANNING MODE */}
      {/* ================================================= */}

      {!rideStarted && (
        <>
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <View
            style={
              styles.planHeader
            }
          >
            <Pressable
              style={
                styles.headerButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>

            <Text
              style={
                styles.planTitle
              }
            >
              PLAN YOUR RIDE
            </Text>

            <Pressable
              style={
                styles.headerButton
              }
              onPress={
                recenter
              }
            >
              <Ionicons
                name="locate-outline"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* DESTINATION SEARCH */}
          {/* ================================================= */}

          <View
            style={
              styles.searchPanel
            }
          >
            <View
              style={
                styles.locationRow
              }
            >
              <View
                style={
                  styles.startDot
                }
              />

              <View
                style={
                  styles.inputArea
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Start Location
                </Text>

                <TextInput
                  value={
                    startText
                  }
                  onChangeText={
                    setStartText
                  }
                  placeholder="Enter starting location..."
                  placeholderTextColor="#718397"
                  style={
                    styles.locationInput
                  }
                  returnKeyType="next"
                />
              </View>

              <Pressable
                style={
                  styles.smallAction
                }
                onPress={() => {
                  if (!coordinate) {
                    Alert.alert(
                      'Location unavailable',
                      'Your current location could not be obtained yet.',
                    );
                    return;
                  }

                  setStartText(
                    'Current Location',
                  );
                  setStartCoordinate({
                    latitude:
                      coordinate.latitude,
                    longitude:
                      coordinate.longitude,
                  });
                }}
              >
                <Ionicons
                  name="locate"
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View
              style={
                styles.verticalLine
              }
            />

            <View
              style={
                styles.locationRow
              }
            >
              <View
                style={
                  styles.destinationDot
                }
              />

              <View
                style={
                  styles.inputArea
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Destination
                </Text>

                <TextInput
                  value={
                    destinationText
                  }
                  onChangeText={
                    setDestinationText
                  }
                  placeholder="Search destination..."
                  placeholderTextColor="#718397"
                  style={
                    styles.locationInput
                  }
                  returnKeyType="search"
                  onSubmitEditing={
                    findRoute
                  }
                />
              </View>

              <Pressable
                style={
                  styles.smallAction
                }
                onPress={
                  findRoute
                }
              >
                <Ionicons
                  name="search"
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>

          {/* ================================================= */}
          {/* SEARCHING */}
          {/* ================================================= */}

          {searching && (
            <View
              style={
                styles.searchingCard
              }
            >
              <ActivityIndicator
                size="small"
                color="#16C7FF"
              />

              <Text
                style={
                  styles.searchingText
                }
              >
                Finding motorcycle route...
              </Text>
            </View>
          )}

          {/* ================================================= */}
          {/* GPS ERROR */}
          {/* ================================================= */}

          {error && (
            <View
              style={
                styles.errorCard
              }
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color="#FFB547"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          )}

          {/* ================================================= */}
          {/* BOTTOM PANEL */}
          {/* ================================================= */}

          <View
            style={
              styles.bottomPlanningPanel
            }
          >
            <View
              style={
                styles.panelHandle
              }
            />

            {!routeReady ? (
              <>
                <View
                  style={
                    styles.recentHeader
                  }
                >
                  <Ionicons
                    name="navigate-outline"
                    size={19}
                    color="#B8C5D2"
                  />

                  <Text
                    style={
                      styles.recentTitle
                    }
                  >
                    Enter your destination
                  </Text>
                </View>

                <Text
                  style={
                    styles.routeHint
                  }
                >
                  Enter both locations above.
                  Tap the location button to use
                  your current GPS position as the start.
                </Text>

                <Pressable
                  style={
                    styles.findRouteButton
                  }
                  onPress={
                    findRoute
                  }
                >
                  <Text
                    style={
                      styles.findRouteText
                    }
                  >
                    FIND MOTORCYCLE ROUTE
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.routeResultHeader
                  }
                >
                  <Text
                    style={
                      styles.routeResultLabel
                    }
                  >
                    MOTORCYCLE ROUTE
                  </Text>

                  <View
                    style={
                      styles.routeBadge
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color="#16E6A2"
                    />

                    <Text
                      style={
                        styles.routeBadgeText
                      }
                    >
                      READY
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.routeInfo
                  }
                >
                  <Text
                    style={
                      styles.routeTime
                    }
                  >
                    {routeMinutes} min
                  </Text>

                  <Text
                    style={
                      styles.routeDistance
                    }
                  >
                    {routeDistance.toFixed(
                      1,
                    )}{' '}
                    km
                  </Text>
                </View>

                <Text
                  style={
                    styles.routeVia
                  }
                >
                  Valhalla motorcycle routing
                </Text>

                <Pressable
                  style={
                    styles.startRideButton
                  }
                  onPress={
                    startRide
                  }
                >
                  <Text
                    style={
                      styles.startRideText
                    }
                  >
                    START RIDE
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </>
            )}
          </View>
        </>
      )}

      {/* ================================================= */}
      {/* ACTIVE NAVIGATION MODE */}
      {/* ================================================= */}

      {rideStarted && (
        <>
          {/* ================================================= */}
          {/* NAVIGATION HEADER */}
          {/* ================================================= */}

          <View
            style={
              styles.navigationHeader
            }
          >
            <Pressable
              style={
                styles.headerButton
              }
              onPress={() =>
                setRideStarted(false)
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>

            <View
              style={
                styles.navigationTitleContainer
              }
            >
              <Text
                style={
                  styles.navigationTitle
                }
              >
                NAVIGATION
              </Text>

              <View
                style={
                  styles.gpsActiveRow
                }
              >
                <View
                  style={
                    styles.gpsActiveDot
                  }
                />

                <Text
                  style={
                    styles.gpsActiveText
                  }
                >
                  GPS ACTIVE
                </Text>
              </View>
            </View>

            <View
              style={
                styles.headerButton
              }
            >
              <Ionicons
                name="settings-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* ================================================= */}
          {/* NEXT MANEUVER CARD */}
          {/* ================================================= */}

          <View
            style={
              styles.navigationCard
            }
          >
            <View
              style={
                styles.turnSection
              }
            >
              <Ionicons
                name="arrow-up-outline"
                size={55}
                color="#8EDBFF"
              />

              <View>
                <Text
                  style={
                    styles.turnDistance
                  }
                >
                  {maneuverDistanceText}
                </Text>

                <Text
                  style={
                    styles.turnInstruction
                  }
                >
                  {maneuverInstruction}
                </Text>

                <Text
                  style={
                    styles.turnRoad
                  }
                >
                  {maneuverRoad}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.navigationDivider
              }
            />

            <View
              style={
                styles.etaSection
              }
            >
              <Text
                style={
                  styles.etaLabel
                }
              >
                ETA
              </Text>

              <Text
                style={
                  styles.etaTime
                }
              >
                {etaTime}
              </Text>

              <Text
                style={
                  styles.etaMinutes
                }
              >
                {routeMinutes} min
              </Text>

              <Text
                style={
                  styles.etaDistance
                }
              >
                {routeDistance.toFixed(
                  1,
                )}{' '}
                km
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* MAP CONTROLS */}
          {/* ================================================= */}

          <View
            style={
              styles.mapControls
            }
          >
            <Pressable
              style={
                styles.mapControl
              }
            >
              <Ionicons
                name="volume-high-outline"
                size={27}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={
                styles.mapControl
              }
            >
              <Ionicons
                name="layers-outline"
                size={27}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={
                styles.mapControl
              }
              onPress={
                recenter
              }
            >
              <Ionicons
                name="locate-outline"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* NEARBY PLACES */}
          {/* ================================================= */}

          <View
            style={
              styles.nearbyPanel
            }
          >
            <Text
              style={
                styles.nearbyTitle
              }
            >
              NEARBY PLACES
            </Text>

            <View
              style={
                styles.nearbyRow
              }
            >
              <Nearby
                icon="⛽"
                label="Fuel"
                distance="1.2 km"
                iconBackground="#06434A"
              />

              <Nearby
                icon="P"
                label="Parking"
                distance="2.1 km"
                iconBackground="#063B67"
              />

              <Nearby
                icon="+"
                label="Hospital"
                distance="3.8 km"
                iconBackground="#5A252B"
              />

              <Nearby
                icon="🍴"
                label="Food"
                distance="4.2 km"
                iconBackground="#5B2C1A"
              />
            </View>
          </View>

          {/* ================================================= */}
          {/* END RIDE */}
          {/* ================================================= */}

          <Pressable
            style={
              styles.endRideButton
            }
            onPress={
              endRide
            }
          >
            <View
              style={
                styles.endRideCircle
              }
            >
              <Ionicons
                name="close"
                size={29}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.endRideText
              }
            >
              End Ride
            </Text>
          </Pressable>
        </>
      )}

      {/* ================================================= */}
      {/* INITIAL GPS LOADING */}
      {/* ================================================= */}

      {loading &&
        !rideStarted && (
          <View
            style={
              styles.locationLoading
            }
          >
            <ActivityIndicator
              size="small"
              color="#16C7FF"
            />

            <Text
              style={
                styles.locationLoadingText
              }
            >
              Getting your location...
            </Text>
          </View>
        )}
    </View>
  );
}

/*
 * ============================================================
 * NEARBY PLACE
 * ============================================================
 */

function Nearby({
  icon,
  label,
  distance,
  iconBackground,
}: NearbyProps) {
  return (
    <View
      style={
        styles.nearbyItem
      }
    >
      <View
        style={[
          styles.nearbyIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Text
          style={
            styles.nearbyIconText
          }
        >
          {icon}
        </Text>
      </View>

      <Text
        style={
          styles.nearbyLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.nearbyDistance
        }
      >
        {distance}
      </Text>
    </View>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  /*
   * ----------------------------------------------------------
   * CONTAINER
   * ----------------------------------------------------------
   */

  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },

  /*
   * ----------------------------------------------------------
   * HEADER
   * ----------------------------------------------------------
   */

  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(5,11,20,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.12)',
  },

  planHeader: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  planTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  /*
   * ----------------------------------------------------------
   * SEARCH PANEL
   * ----------------------------------------------------------
   */

  searchPanel: {
    position: 'absolute',
    top: 105,
    left: 18,
    right: 18,
    zIndex: 20,
    backgroundColor:
      'rgba(6,16,28,0.96)',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#182D42',
    paddingVertical: 5,
  },

  locationRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  startDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16C7FF',
    borderWidth: 2,
    borderColor: '#8EE9FF',
    marginRight: 13,
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#FF4E55',
    borderWidth: 2,
    borderColor: '#FFB0B3',
    marginRight: 13,
  },

  verticalLine: {
    position: 'absolute',
    left: 22,
    top: 66,
    width: 1,
    height: 39,
    backgroundColor: '#516477',
  },

  inputArea: {
    flex: 1,
  },

  inputLabel: {
    color: '#7E91A4',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },

  locationInput: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },

  smallAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(21,39,57,0.9)',
  },

  /*
   * ----------------------------------------------------------
   * SEARCH STATUS
   * ----------------------------------------------------------
   */

  searchingCard: {
    position: 'absolute',
    top: 275,
    left: 20,
    right: 20,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor:
      'rgba(5,11,20,0.94)',
  },

  searchingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 11,
  },

  errorCard: {
    position: 'absolute',
    top: 275,
    left: 20,
    right: 20,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor:
      'rgba(5,11,20,0.94)',
  },

  errorText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 10,
    flex: 1,
  },

  /*
   * ----------------------------------------------------------
   * BOTTOM PLANNING PANEL
   * ----------------------------------------------------------
   */

  bottomPlanningPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor:
      'rgba(5,11,20,0.98)',
    borderTopWidth: 1,
    borderColor: '#182D42',
  },

  panelHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#3B5064',
    alignSelf: 'center',
    marginBottom: 17,
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  recentTitle: {
    color: '#F5F7FA',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },

  routeHint: {
    color: '#8293A4',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 5,
  },

  /*
   * ----------------------------------------------------------
   * FIND ROUTE
   * ----------------------------------------------------------
   */

  findRouteButton: {
    height: 54,
    borderRadius: 16,
    marginTop: 16,
    backgroundColor: '#0868F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  findRouteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginRight: 8,
  },

  /*
   * ----------------------------------------------------------
   * ROUTE RESULT
   * ----------------------------------------------------------
   */

  routeResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  routeResultLabel: {
    color: '#7F91A3',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#092C28',
  },

  routeBadgeText: {
    color: '#16E6A2',
    fontSize: 8,
    fontWeight: '800',
    marginLeft: 3,
  },

  routeInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 7,
  },

  routeTime: {
    color: '#16E6A2',
    fontSize: 25,
    fontWeight: '800',
  },

  routeDistance: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  routeVia: {
    color: '#8A9AAB',
    fontSize: 10,
    marginTop: 3,
  },

  startRideButton: {
    height: 54,
    borderRadius: 16,
    marginTop: 15,
    backgroundColor: '#0868F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startRideText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginRight: 8,
  },

  /*
   * ----------------------------------------------------------
   * MARKERS
   * ----------------------------------------------------------
   */

  startMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      'rgba(22,199,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startMarkerDot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#1674FF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  destinationMarker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4434B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * ----------------------------------------------------------
   * ACTIVE NAVIGATION HEADER
   * ----------------------------------------------------------
   */

  navigationHeader: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navigationTitleContainer: {
    alignItems: 'center',
  },

  navigationTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.8,
  },

  gpsActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  gpsActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#18D17F',
    marginRight: 5,
  },

  gpsActiveText: {
    color: '#AFC1CF',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /*
   * ----------------------------------------------------------
   * NAVIGATION CARD
   * ----------------------------------------------------------
   */

  navigationCard: {
    position: 'absolute',
    top: 85,
    left: 18,
    right: 18,
    zIndex: 25,
    minHeight: 158,
    borderRadius: 20,
    backgroundColor:
      'rgba(6,16,28,0.96)',
    borderWidth: 1,
    borderColor: '#1B3045',
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 17,
  },

  turnSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  turnDistance: {
    color: '#F5F7FA',
    fontSize: 25,
    fontWeight: '700',
  },

  turnInstruction: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '500',
    marginTop: 3,
  },

  turnRoad: {
    color: '#8A9AAB',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
  },

  navigationDivider: {
    width: 1,
    backgroundColor: '#2A3E51',
    marginVertical: 4,
    marginHorizontal: 13,
  },

  etaSection: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaLabel: {
    color: '#899AAA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  etaTime: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 7,
  },

  etaMinutes: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 17,
  },

  etaDistance: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 7,
  },

  /*
   * ----------------------------------------------------------
   * MAP CONTROLS
   * ----------------------------------------------------------
   */

  mapControls: {
    position: 'absolute',
    right: 17,
    top: '46%',
    zIndex: 25,
    gap: 10,
  },

  mapControl: {
    width: 53,
    height: 53,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(5,11,20,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.14)',
  },

  /*
   * ----------------------------------------------------------
   * NEARBY PLACES
   * ----------------------------------------------------------
   */

  nearbyPanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 98,
    zIndex: 25,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 17,
    borderRadius: 22,
    backgroundColor:
      'rgba(5,16,28,0.97)',
    borderWidth: 1,
    borderColor: '#1B3045',
  },

  nearbyTitle: {
    color: '#F5F7FA',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 13,
  },

  nearbyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  nearbyItem: {
    alignItems: 'center',
    width: '24%',
  },

  nearbyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nearbyIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  nearbyLabel: {
    color: '#F5F7FA',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 7,
    textAlign: 'center',
  },

  nearbyDistance: {
    color: '#91A1B1',
    fontSize: 9,
    marginTop: 3,
  },

  /*
   * ----------------------------------------------------------
   * END RIDE
   * ----------------------------------------------------------
   */

  endRideButton: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 20,
    height: 58,
    zIndex: 30,
    borderRadius: 30,
    backgroundColor:
      'rgba(24,37,53,0.98)',
    borderWidth: 1,
    borderColor: '#34485C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  endRideCircle: {
    position: 'absolute',
    left: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(5,11,20,0.85)',
    borderWidth: 1,
    borderColor: '#465A6E',
  },

  endRideText: {
    color: '#FF4B3E',
    fontSize: 14,
    fontWeight: '800',
  },

  /*
   * ----------------------------------------------------------
   * GPS LOADING
   * ----------------------------------------------------------
   */

  locationLoading: {
    position: 'absolute',
    top: 230,
    left: 20,
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor:
      'rgba(5,11,20,0.90)',
  },

  locationLoadingText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 7,
  },
});