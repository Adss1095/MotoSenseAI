import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type CurrentLocationState = {
  coordinate: Coordinate | null;
  loading: boolean;
  error: string | null;
};

export function useCurrentLocation(): CurrentLocationState {
  const [coordinate, setCoordinate] =
    useState<Coordinate | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function getCurrentLocation() {
      try {
        setLoading(true);
        setError(null);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (mounted) {
            setError(
              'Location permission was denied.',
            );
            setLoading(false);
          }

          return;
        }

        const location =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          });

        if (!mounted) {
          return;
        }

        setCoordinate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setLoading(false);
      } catch (locationError) {
        console.error(
          'CURRENT LOCATION ERROR:',
          locationError,
        );

        if (mounted) {
          setError(
            locationError instanceof Error
              ? locationError.message
              : 'Unable to get your current location.',
          );

          setLoading(false);
        }
      }
    }

    getCurrentLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    coordinate,
    loading,
    error,
  };
}