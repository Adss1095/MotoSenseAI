import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calculateMotorcycleRoute } from "../services/routing";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function DashboardMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const placeAutocompleteContainerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const autocompleteListenerRef = useRef<any>(null);
  const alternativePolylinesRef = useRef<any[]>([]);
  const currentLocationRef = useRef<Coordinate | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCoordinate, setDestinationCoordinate] =
    useState<Coordinate | null>(null);
  const [routeReady, setRouteReady] = useState(false);
  const [currentLocationName, setCurrentLocationName] =
    useState("Current location");
  const [routeDuration, setRouteDuration] = useState("");
  const [routeDistance, setRouteDistance] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    injectGoogleAutocompleteStyles();
    loadMap();

    return () => {
      if (
        autocompleteRef.current &&
        autocompleteListenerRef.current
      ) {
        autocompleteRef.current.removeEventListener(
          "gmp-select",
          autocompleteListenerRef.current
        );
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null);
      }

      if (routeLineRef.current) {
        routeLineRef.current.setMap(null);
        routeLineRef.current = null;
      }

      clearAlternativeRoutes();
      mapRef.current = null;
      autocompleteRef.current = null;
    };
  }, []);

  function injectGoogleAutocompleteStyles() {
    if (document.getElementById("motosense-google-autocomplete-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "motosense-google-autocomplete-style";
    style.innerHTML = `
      .pac-container {
        z-index: 999999 !important;
        margin-top: 6px !important;
        border: 1px solid #1E3A50 !important;
        border-radius: 12px !important;
        background: #081725 !important;
        box-shadow: 0 14px 35px rgba(0,0,0,.45) !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      }

      .pac-item {
        min-height: 44px !important;
        padding: 10px 12px !important;
        border-top: 1px solid #14283A !important;
        color: #CBD5E1 !important;
        background: #081725 !important;
        font-size: 13px !important;
        line-height: 24px !important;
      }

      .pac-item:first-child {
        border-top: none !important;
      }

      .pac-item:hover,
      .pac-item-selected {
        background: #102235 !important;
      }

      .pac-item-query {
        color: #F8FAFC !important;
        font-weight: 700 !important;
      }

      .pac-matched {
        color: #168BFF !important;
        font-weight: 800 !important;
      }

      .pac-icon {
        filter: invert(1) opacity(.65) !important;
      }

      .motosense-place-autocomplete {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        --gmpx-color-surface: #061321;
        --gmpx-color-on-surface: #F8FAFC;
        --gmpx-color-on-surface-variant: #94A3B8;
        --gmpx-color-primary: #168BFF;
        --gmpx-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
    `;

    document.head.appendChild(style);
  }

  async function loadMap() {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        throw new Error(
          "Google Maps API key is missing. Check your .env file."
        );
      }

      await loadGoogleMaps();

      if (!mapContainerRef.current) {
        return;
      }

      const google = (window as any).google;

      const map = new google.maps.Map(mapContainerRef.current, {
        center: {
          lat: 12.9716,
          lng: 77.5946,
        },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#071321" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#71859A" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#071321" }],
          },
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ color: "#203348" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#071321" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#0B1B2A" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#60778B" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#14283A" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#0B1724" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#526B80" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#1B344A" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#03101C" }],
          },
        ],
      });

      mapRef.current = map;

      await setupGoogleAutocomplete();
      getCurrentLocation(map);
    } catch (err) {
      console.error("MAP ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Google Maps."
      );
      setLoading(false);
    }
  }

  async function setupGoogleAutocomplete() {
    const google = (window as any).google;
    const host = placeAutocompleteContainerRef.current;

    if (!google?.maps?.importLibrary || !host) {
      console.error("Google Places library is unavailable.");
      return;
    }

    try {
      const placesLibrary = await google.maps.importLibrary("places");
      const PlaceAutocompleteElement =
        placesLibrary?.PlaceAutocompleteElement;

      if (!PlaceAutocompleteElement) {
        console.error(
          "Google Place Autocomplete (New) is unavailable."
        );
        return;
      }

      host.innerHTML = "";

      const autocomplete = new PlaceAutocompleteElement({
        includedRegionCodes: ["in"],
      });

      autocomplete.placeholder = "Enter destination";
      autocomplete.className = "motosense-place-autocomplete";

      host.appendChild(autocomplete);

      autocompleteRef.current = autocomplete;

      const placeChangedHandler = async (event: any) => {
        try {
          const placePrediction = event?.placePrediction;

          if (!placePrediction) {
            return;
          }

          const place = placePrediction.toPlace();

          await place.fetchFields({
            fields: [
              "displayName",
              "formattedAddress",
              "location",
              "viewport",
            ],
          });

          const location = place.location;

          if (!location) {
            setRouteDuration("");
            setRouteDistance("");
            return;
          }

          const address =
            place.formattedAddress ||
            place.displayName ||
            "";

          setDestination(address);
          const selectedCoordinate: Coordinate = {
            latitude: location.lat(),
            longitude: location.lng(),
          };
          setDestinationCoordinate(selectedCoordinate);

          calculateRoute(selectedCoordinate);
        } catch (selectionError) {
          console.error(
            "PLACE SELECTION ERROR:",
            selectionError
          );
          setRouteDuration("");
          setRouteDistance("");
        }
      };

      autocompleteListenerRef.current = placeChangedHandler;

      autocomplete.addEventListener(
        "gmp-select",
        placeChangedHandler
      );
    } catch (autocompleteError) {
      console.error(
        "GOOGLE AUTOCOMPLETE ERROR:",
        autocompleteError
      );
    }
  }

  function loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingGoogle = (window as any).google;

      if (existingGoogle?.maps?.places) {
        resolve();
        return;
      }

      const existingScript = document.getElementById(
        "motosense-google-maps"
      );

      if (existingScript) {
        const timer = window.setInterval(() => {
          if ((window as any).google?.maps?.places) {
            window.clearInterval(timer);
            resolve();
          }
        }, 100);

        window.setTimeout(() => {
          window.clearInterval(timer);
          reject(new Error("Google Maps took too long to load."));
        }, 15000);

        return;
      }

      const script = document.createElement("script");
      script.id = "motosense-google-maps";
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          GOOGLE_MAPS_API_KEY
        )}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error(
            "Google Maps could not be loaded. Check your API key and enabled APIs."
          )
        );

      document.head.appendChild(script);
    });
  }

  function getCurrentLocation(map: any) {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current: Coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        currentLocationRef.current = current;

        const google = (window as any).google;
        const positionObject = {
          lat: current.latitude,
          lng: current.longitude,
        };

        map.setCenter(positionObject);
        map.setZoom(15);

        markerRef.current = new google.maps.Marker({
          position: positionObject,
          map,
          title: "Your Location",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#168BFF",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
        });

        reverseGeocodeCurrentLocation(positionObject);
        setLoading(false);
      },
      (locationError) => {
        console.log("LOCATION ERROR:", locationError);

        map.setCenter({
          lat: 12.9716,
          lng: 77.5946,
        });
        map.setZoom(13);
        setCurrentLocationName("Location permission not granted");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }

  function reverseGeocodeCurrentLocation(position: {
    lat: number;
    lng: number;
  }) {
    const google = (window as any).google;

    if (!google?.maps?.Geocoder) {
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      { location: position },
      (results: any[], status: string) => {
        if (status === "OK" && results?.length) {
          setCurrentLocationName(results[0].formatted_address);
        }
      }
    );
  }

  function clearAlternativeRoutes() {
    alternativePolylinesRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });
    alternativePolylinesRef.current = [];
  }

  function clearRoute() {
    const google = (window as any).google;

    if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
      routeLineRef.current = null;
    }

    clearAlternativeRoutes();

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }

    setRouteDuration("");
    setRouteDistance("");
    setRouteReady(false);
    setDestinationCoordinate(null);

    if (autocompleteRef.current) {
      autocompleteRef.current.value = "";
    }

    setDestination("");
  }

  async function calculateRoute(
    destinationCoordinateOverride?: Coordinate
  ) {
    const current = currentLocationRef.current;
    const destinationToUse =
      destinationCoordinateOverride || destinationCoordinate;

    if (!current) {
      console.log("ROUTE ERROR: Current location is not available.");
      setRouteDuration("");
      setRouteDistance("");
      return;
    }

    if (!destinationToUse) {
      console.log("ROUTE ERROR: Destination is not selected.");
      setRouteDuration("");
      setRouteDistance("");
      return;
    }

    try {
      setRouteLoading(true);
      setRouteDuration("");
      setRouteDistance("");
      setRouteReady(false);

      console.log("CALCULATING MOTORCYCLE ROUTE...");
      console.log("START:", current);
      console.log("DESTINATION:", destinationToUse);

      const route = await calculateMotorcycleRoute(
        {
          lat: current.latitude,
          lon: current.longitude,
        },
        {
          lat: destinationToUse.latitude,
          lon: destinationToUse.longitude,
        }
      );

      console.log("VALHALLA ROUTE:", route);

      setRouteDistance(`${route.distanceKm.toFixed(1)} km`);
      setRouteDuration(`${route.durationMinutes} min`);

      drawRoute(route.points);
      setRouteReady(true);
    } catch (routeError) {
      console.error("VALHALLA ROUTE ERROR:", routeError);
      setRouteDuration("");
      setRouteDistance("");
      setRouteReady(false);
    } finally {
      setRouteLoading(false);
    }
  }

  function drawRoute(points: Coordinate[]) {
    const google = (window as any).google;

    if (
      !google?.maps ||
      !mapRef.current ||
      !points ||
      points.length < 2
    ) {
      console.log("ROUTE DRAW ERROR: Invalid route points.");
      return;
    }

    if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
      routeLineRef.current = null;
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }

    const path = points.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));

    routeLineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#168BFF",
      strokeOpacity: 0.98,
      strokeWeight: 6,
      map: mapRef.current,
      zIndex: 100,
    });

    destinationMarkerRef.current = new google.maps.Marker({
      position: path[path.length - 1],
      map: mapRef.current,
      title: "Destination",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF453A",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 3,
      },
    });

    const bounds = new google.maps.LatLngBounds();

    path.forEach((point) => bounds.extend(point));

    mapRef.current.fitBounds(bounds, 80);
  }

  function handleStartNavigation() {
    if (!destination.trim()) {
      const autocompleteInput =
        placeAutocompleteContainerRef.current?.querySelector(
          "input"
        ) as HTMLInputElement | null;

      autocompleteInput?.focus();
      return;
    }

    calculateRoute(destinationCoordinate || undefined);
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Map unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAP */}
      <View style={styles.mapWrapper}>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>

      {/* LIVE NAVIGATION LABEL */}
      <View style={styles.navigationBadge}>
        <Ionicons name="navigate" size={14} color="#168BFF" />
        <Text style={styles.navigationBadgeText}>LIVE NAVIGATION</Text>
      </View>

      {/* ROUTE INPUT */}
      <View style={styles.routeInputCard}>
        <View style={styles.routeColumn}>
          <Text style={styles.routeLabel}>FROM</Text>

          <View style={styles.locationRow}>
            <View style={styles.blueLocationDot} />
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationTitle}>Your Location</Text>
              <Text style={styles.locationSubtitle} numberOfLines={1}>
                {currentLocationName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.routeDivider} />

        <View style={styles.routeColumn}>
          <Text style={styles.routeLabel}>TO</Text>

          <View style={styles.destinationRow}>
            <Ionicons name="location" size={21} color="#FF453A" />

            <View
              ref={placeAutocompleteContainerRef}
              style={styles.autocompleteHost}
            />

            {destination.length > 0 && (
              <Pressable
                onPress={clearRoute}
                style={styles.clearButton}
                accessibilityLabel="Clear destination"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            )}
          </View>

          <Text style={styles.googleHint}>
            Choose a destination from Google suggestions to calculate the route.
          </Text>
        </View>
      </View>

      {/* ROUTE INFORMATION */}
      <View style={styles.routeInfoCard}>
        <View style={styles.routeInfo}>
          <View style={styles.timeIcon}>
            <Ionicons name="time-outline" size={28} color="#CBD5E1" />
          </View>

          <View>
            <Text style={styles.routeTime}>
              {routeLoading
                ? "Calculating..."
                : routeDuration || "-- min"}
              {!routeLoading && routeDistance
                ? `  (${routeDistance})`
                : ""}
            </Text>

            <Text style={styles.routeSubtitle}>
              {routeDuration
                ? "Fastest route"
                : "Choose a destination to calculate"}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.startNavigationButton,
            (!destination.trim() || routeLoading) &&
              styles.startNavigationButtonDisabled,
          ]}
          onPress={handleStartNavigation}
          disabled={!destination.trim() || routeLoading}
        >
          {routeLoading ? (
            <ActivityIndicator size="small" color="#168BFF" />
          ) : (
            <Ionicons name="navigate" size={23} color="#168BFF" />
          )}

          <Text style={styles.startNavigationText}>Start Navigation</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#229BFF" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#071321",
  },

  mapWrapper: {
    flex: 1,
    minHeight: 360,
    zIndex: 0,
  },

  navigationBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(2, 10, 20, 0.94)",
    zIndex: 10,
  },

  navigationBadgeText: {
    marginLeft: 7,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  routeInputCard: {
    flexDirection: "row",
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#12304A",
    backgroundColor: "#061321",
    zIndex: 1000,
    elevation: 1000,
  },

  routeColumn: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    zIndex: 1001,
  },

  routeDivider: {
    width: 1,
    backgroundColor: "#1E3A50",
    marginHorizontal: 16,
  },

  routeLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 9,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  blueLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#168BFF",
    marginRight: 9,
  },

  locationTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F8FAFC",
  },

  locationSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  autocompleteHost: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
    zIndex: 10000,
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  googleHint: {
    marginTop: 6,
    color: "#526B80",
    fontSize: 10,
  },

  routeInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#12304A",
    backgroundColor: "#061321",
  },

  routeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  timeIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#102235",
    marginRight: 12,
  },

  routeTime: {
    fontSize: 16,
    fontWeight: "900",
    color: "#F8FAFC",
  },

  routeSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  startNavigationButton: {
    minWidth: 205,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#0284C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  startNavigationButtonDisabled: {
    opacity: 0.45,
  },

  startNavigationText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#168BFF",
  },

  loading: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(5, 15, 27, 0.92)",
    zIndex: 20,
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 10,
    marginLeft: 7,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071321",
    padding: 20,
  },

  errorTitle: {
    color: "#FF453A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  errorText: {
    color: "#71859A",
    fontSize: 10,
    textAlign: "center",
  },
});