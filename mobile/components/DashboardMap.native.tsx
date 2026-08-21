import React, { useEffect, useRef } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MapView, {
  PROVIDER_GOOGLE,
  Marker,
} from "react-native-maps";

import { useCurrentLocation } from "@/hooks/useCurrentLocation";

export default function DashboardMap() {
  const mapRef =
    useRef<MapView>(null);

  const {
    coordinate,
  } = useCurrentLocation();

  useEffect(() => {
    if (!coordinate) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude:
          coordinate.latitude,

        longitude:
          coordinate.longitude,

        latitudeDelta: 0.012,

        longitudeDelta: 0.012,
      },

      800
    );
  }, [coordinate]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}

        provider={PROVIDER_GOOGLE}

        style={styles.map}

        initialRegion={{
          latitude: 12.9716,
          longitude: 77.5946,

          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}

        showsUserLocation={true}

        showsMyLocationButton={true}

        showsCompass={false}

        toolbarEnabled={false}

        loadingEnabled={true}

        moveOnMarkerPress={false}
      >
        {coordinate && (
          <Marker
            coordinate={{
              latitude:
                coordinate.latitude,

              longitude:
                coordinate.longitude,
            }}

            title="Your Location"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },
});