import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  calculateMotorcycleRoute,
} from '../../services/routing';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Suggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

type InputType = 'start' | 'destination' | null;

type GoogleWindow = Window & {
  google?: any;
};

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function MapWeb() {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<any>(null);

  const routeLineRef =
    useRef<any>(null);

  const startMarkerRef =
    useRef<any>(null);

  const destinationMarkerRef =
    useRef<any>(null);

  const [mapLoaded, setMapLoaded] =
    useState(false);

  const [mapError, setMapError] =
    useState('');

  const [startText, setStartText] =
    useState('');

  const [destinationText, setDestinationText] =
    useState('');

  const [startCoordinate, setStartCoordinate] =
    useState<Coordinate | null>(null);

  const [destinationCoordinate, setDestinationCoordinate] =
    useState<Coordinate | null>(null);

  const [currentLocation, setCurrentLocation] =
    useState<Coordinate | null>(null);

  const [activeInput, setActiveInput] =
    useState<InputType>(null);

  const [suggestions, setSuggestions] =
    useState<Suggestion[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [routeReady, setRouteReady] =
    useState(false);

  const [routeDistance, setRouteDistance] =
    useState(0);

  const [routeMinutes, setRouteMinutes] =
    useState(0);

  const [rideStarted, setRideStarted] =
    useState(false);

  useEffect(() => {
    loadGoogleMaps();

    return () => {
      if (routeLineRef.current) {
        routeLineRef.current.setMap(null);
      }

      if (startMarkerRef.current) {
        startMarkerRef.current.setMap(null);
      }

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null);
      }
    };
  }, []);

  /*
   * ============================================================
   * GOOGLE MAPS LOADING
   * ============================================================
   */

  function loadGoogleMaps() {
    const googleWindow =
      window as GoogleWindow;

    if (googleWindow.google?.maps) {
      initializeMap();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError(
        'Google Maps API key is missing. Check your .env file.'
      );
      return;
    }

    const existingScript =
      document.getElementById(
        'motosense-google-maps'
      ) as HTMLScriptElement | null;

    if (existingScript) {
      waitForGoogleMaps();
      return;
    }

    const callbackName =
      '__motosenseGoogleMapsLoaded';

    (window as any)[callbackName] = () => {
      initializeMap();
    };

    const script =
      document.createElement('script');

    script.id =
      'motosense-google-maps';

    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        GOOGLE_MAPS_API_KEY
      )}&libraries=places&loading=async&callback=${callbackName}`;

    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setMapError(
        'Google Maps could not be loaded. Check your API key and Google Maps JavaScript API.'
      );
    };

    document.head.appendChild(script);
  }

  function waitForGoogleMaps() {
    let attempts = 0;

    const timer =
      window.setInterval(() => {
        attempts += 1;

        const googleWindow =
          window as GoogleWindow;

        if (googleWindow.google?.maps) {
          window.clearInterval(timer);
          initializeMap();
          return;
        }

        if (attempts >= 100) {
          window.clearInterval(timer);

          setMapError(
            'Google Maps took too long to load.'
          );
        }
      }, 100);
  }

  /*
   * ============================================================
   * INITIALIZE MAP
   * ============================================================
   */

  function initializeMap() {
    const googleWindow =
      window as GoogleWindow;

    if (!googleWindow.google?.maps) {
      return;
    }

    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    mapRef.current =
      new googleWindow.google.maps.Map(
        mapContainerRef.current,
        {
          center: {
            lat: 12.9716,
            lng: 77.5946,
          },

          zoom: 13,

          mapTypeControl: false,

          streetViewControl: false,

          fullscreenControl: false,

          zoomControl: true,

          gestureHandling: 'greedy',
        }
      );

    setMapLoaded(true);

    getCurrentLocation();
  }

  /*
   * ============================================================
   * CURRENT LOCATION
   * ============================================================
   */

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinate: Coordinate = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setCurrentLocation(
          coordinate
        );

        setStartCoordinate(
          coordinate
        );

        setStartText(
          'Your location'
        );

        if (mapRef.current) {
          mapRef.current.setCenter({
            lat:
              coordinate.latitude,

            lng:
              coordinate.longitude,
          });

          mapRef.current.setZoom(
            15
          );
        }

        addCurrentLocationMarker(
          coordinate
        );

        setLocationLoading(false);
      },

      (error) => {
        console.log(
          'LOCATION ERROR:',
          error
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 30000,
      }
    );
  }

  function addCurrentLocationMarker(
    coordinate: Coordinate
  ) {
    const googleWindow =
      window as GoogleWindow;

    if (
      !googleWindow.google?.maps ||
      !mapRef.current
    ) {
      return;
    }

    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(
        null
      );
    }

    startMarkerRef.current =
      new googleWindow.google.maps.Marker(
        {
          position: {
            lat:
              coordinate.latitude,

            lng:
              coordinate.longitude,
          },

          map:
            mapRef.current,

          title:
            'Your location',
        }
      );
  }

  /*
   * ============================================================
   * SEARCH SUGGESTIONS
   * ============================================================
   */

  async function searchPlaces(
    text: string,
    inputType: InputType
  ) {
    if (
      text.trim().length < 3
    ) {
      setSuggestions([]);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return;
    }

    try {
      const response =
        await fetch(
          'https://places.googleapis.com/v1/places:autocomplete',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              'X-Goog-Api-Key':
                GOOGLE_MAPS_API_KEY,

              'X-Goog-FieldMask':
                'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
            },

            body: JSON.stringify({
              input:
                text.trim(),

              regionCode:
                'IN',

              languageCode:
                'en',
            }),
          }
        );

      if (!response.ok) {
        console.log(
          'Places API:',
          response.status
        );

        return;
      }

      const data =
        await response.json();

      const results: Suggestion[] =
        (
          data?.suggestions ||
          []
        )
          .filter(
            (item: any) =>
              item.placePrediction
          )
          .map(
            (item: any) => ({
              placeId:
                item.placePrediction
                  .placeId,

              primaryText:
                item.placePrediction
                  .structuredFormat
                  ?.mainText
                  ?.text ||
                item.placePrediction
                  .text
                  ?.text ||
                '',

              secondaryText:
                item.placePrediction
                  .structuredFormat
                  ?.secondaryText
                  ?.text ||
                '',
            })
          )
          .filter(
            (item: Suggestion) =>
              item.primaryText
          )
          .slice(0, 5);

      setSuggestions(
        results
      );

      setActiveInput(
        inputType
      );
    } catch (error) {
      console.log(
        'PLACE SEARCH ERROR:',
        error
      );

      setSuggestions([]);
    }
  }

  /*
   * ============================================================
   * SELECT PLACE
   * ============================================================
   */

  async function selectPlace(
    suggestion: Suggestion
  ) {
    try {
      const response =
        await fetch(
          `https://places.googleapis.com/v1/places/${suggestion.placeId}`,
          {
            headers: {
              'X-Goog-Api-Key':
                GOOGLE_MAPS_API_KEY,

              'X-Goog-FieldMask':
                'location,displayName,formattedAddress',
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          'Unable to get selected place.'
        );
      }

      const data =
        await response.json();

      if (!data.location) {
        throw new Error(
          'Selected place has no coordinates.'
        );
      }

      const coordinate: Coordinate =
        {
          latitude:
            data.location.latitude,

          longitude:
            data.location.longitude,
        };

      if (
        activeInput ===
        'start'
      ) {
        setStartText(
          suggestion.primaryText
        );

        setStartCoordinate(
          coordinate
        );
      }

      if (
        activeInput ===
        'destination'
      ) {
        setDestinationText(
          suggestion.primaryText
        );

        setDestinationCoordinate(
          coordinate
        );

        if (mapRef.current) {
          mapRef.current.panTo({
            lat:
              coordinate.latitude,

            lng:
              coordinate.longitude,
          });
        }
      }

      setSuggestions([]);

      setActiveInput(null);
    } catch (error) {
      console.log(
        'PLACE DETAILS ERROR:',
        error
      );
    }
  }

  /*
   * ============================================================
   * USE CURRENT LOCATION
   * ============================================================
   */

  function useMyLocation() {
    if (!currentLocation) {
      getCurrentLocation();
      return;
    }

    setStartText(
      'Your location'
    );

    setStartCoordinate(
      currentLocation
    );

    setSuggestions([]);

    setActiveInput(null);

    if (mapRef.current) {
      mapRef.current.panTo({
        lat:
          currentLocation.latitude,

        lng:
          currentLocation.longitude,
      });

      mapRef.current.setZoom(
        15
      );
    }
  }

  /*
   * ============================================================
   * FIND MOTORCYCLE ROUTE
   * ============================================================
   */

  async function findRoute() {
    if (!startCoordinate) {
      window.alert(
        'Please select a starting location.'
      );

      return;
    }

    if (!destinationCoordinate) {
      window.alert(
        'Please search and select a destination.'
      );

      return;
    }

    try {
      setSearching(true);

      setSuggestions([]);

      const route =
        await calculateMotorcycleRoute(
          {
            lat:
              startCoordinate.latitude,

            lon:
              startCoordinate.longitude,
          },

          {
            lat:
              destinationCoordinate.latitude,

            lon:
              destinationCoordinate.longitude,
          }
        );

      setRouteDistance(
        route.distanceKm
      );

      setRouteMinutes(
        route.durationMinutes
      );

      drawRoute(
        route.points
      );

      setRouteReady(true);
    } catch (error) {
      console.log(
        'ROUTE ERROR:',
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to calculate motorcycle route.'
      );
    } finally {
      setSearching(false);
    }
  }

  /*
   * ============================================================
   * DRAW ROUTE
   * ============================================================
   */

  function drawRoute(
    points: Coordinate[]
  ) {
    const googleWindow =
      window as GoogleWindow;

    if (
      !googleWindow.google?.maps ||
      !mapRef.current ||
      !points ||
      points.length < 2
    ) {
      return;
    }

    if (routeLineRef.current) {
      routeLineRef.current.setMap(
        null
      );
    }

    if (
      startMarkerRef.current
    ) {
      startMarkerRef.current.setMap(
        null
      );
    }

    if (
      destinationMarkerRef.current
    ) {
      destinationMarkerRef.current.setMap(
        null
      );
    }

    const path =
      points.map(
        (point) => ({
          lat:
            point.latitude,

          lng:
            point.longitude,
        })
      );

    routeLineRef.current =
      new googleWindow.google.maps.Polyline(
        {
          path,

          geodesic: true,

          strokeColor:
            '#168BFF',

          strokeOpacity: 1,

          strokeWeight: 6,

          map:
            mapRef.current,
        }
      );

    const bounds =
      new googleWindow.google.maps.LatLngBounds();

    points.forEach(
      (point) => {
        bounds.extend({
          lat:
            point.latitude,

          lng:
            point.longitude,
        });
      }
    );

    mapRef.current.fitBounds(
      bounds,
      100
    );

    startMarkerRef.current =
      new googleWindow.google.maps.Marker(
        {
          position: path[0],

          map:
            mapRef.current,

          title:
            'Start location',
        }
      );

    destinationMarkerRef.current =
      new googleWindow.google.maps.Marker(
        {
          position:
            path[
              path.length - 1
            ],

          map:
            mapRef.current,

          title:
            'Destination',
        }
      );
  }

  /*
   * ============================================================
   * CLEAR DESTINATION
   * ============================================================
   */

  function clearDestination() {
    setDestinationText('');

    setDestinationCoordinate(
      null
    );

    setSuggestions([]);

    setRouteReady(false);

    setRouteDistance(0);

    setRouteMinutes(0);

    if (routeLineRef.current) {
      routeLineRef.current.setMap(
        null
      );

      routeLineRef.current =
        null;
    }

    if (
      destinationMarkerRef.current
    ) {
      destinationMarkerRef.current.setMap(
        null
      );

      destinationMarkerRef.current =
        null;
    }
  }

  /*
   * ============================================================
   * SWAP
   * ============================================================
   */

  function swapLocations() {
    const oldStartText =
      startText;

    const oldStartCoordinate =
      startCoordinate;

    setStartText(
      destinationText
    );

    setStartCoordinate(
      destinationCoordinate
    );

    setDestinationText(
      oldStartText
    );

    setDestinationCoordinate(
      oldStartCoordinate
    );

    setRouteReady(false);

    setSuggestions([]);
  }

  /*
   * ============================================================
   * START RIDE
   * ============================================================
   */

  function startRide() {
    setRideStarted(true);
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#050B14',
        overflow: 'hidden',
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      {/* ====================================================== */}
      {/* GOOGLE MAP */}
      {/* ====================================================== */}

      <div
        ref={
          mapContainerRef
        }
        style={{
          position:
            'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* ====================================================== */}
      {/* TOP HEADER */}
      {/* ====================================================== */}

      {!rideStarted && (
        <div
          style={{
            position:
              'absolute',
            top: 22,
            left: 22,
            right: 22,
            zIndex: 20,
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
          }}
        >
          <button
            onClick={() =>
              window.history.back()
            }
            style={{
              width: 44,
              height: 44,
              borderRadius:
                '50%',
              border:
                '1px solid #293C4E',
              backgroundColor:
                'rgba(5,11,20,0.94)',
              color:
                '#FFFFFF',
              fontSize: 22,
              cursor:
                'pointer',
            }}
          >
            ←
          </button>

          <div
            style={{
              color:
                '#FFFFFF',
              fontSize: 14,
              fontWeight:
                800,
              letterSpacing:
                1.5,
            }}
          >
            PLAN YOUR RIDE
          </div>

          <div
            style={{
              width: 44,
              height: 44,
            }}
          />
        </div>
      )}

      {/* ====================================================== */}
      {/* GOOGLE MAPS STYLE INPUT CARD */}
      {/* ====================================================== */}

      {!rideStarted && (
        <div
          style={{
            position:
              'absolute',
            top: 65,
            left: '50%',
            transform:
              'translateX(-50%)',
            width:
              'min(620px, calc(100% - 36px))',
            zIndex: 25,
          }}
        >
          <div
            style={{
              position:
                'relative',
              backgroundColor:
                'rgba(5,15,26,0.97)',
              border:
                '1px solid #263B4F',
              borderRadius:
                18,
              padding:
                '8px 10px',
              boxShadow:
                '0 12px 35px rgba(0,0,0,0.35)',
            }}
          >
            {/* START INPUT */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                height: 55,
              }}
            >
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius:
                    '50%',
                  backgroundColor:
                    '#18B8FF',
                  margin:
                    '0 12px',
                  flexShrink: 0,
                }}
              />

              <input
                value={
                  startText
                }
                onFocus={() => {
                  setActiveInput(
                    'start'
                  );

                  setSuggestions([]);
                }}
                onChange={(
                  event
                ) => {
                  const value =
                    event.target.value;

                  setStartText(
                    value
                  );

                  setStartCoordinate(
                    null
                  );

                  searchPlaces(
                    value,
                    'start'
                  );
                }}
                placeholder="Your location"
                style={{
                  flex: 1,
                  border:
                    'none',
                  outline:
                    'none',
                  background:
                    'transparent',
                  color:
                    '#FFFFFF',
                  fontSize: 15,
                  padding:
                    '8px 0',
                }}
              />

              <button
                onClick={
                  useMyLocation
                }
                title="Use my current location"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius:
                    '50%',
                  border:
                    'none',
                  backgroundColor:
                    '#172A3D',
                  color:
                    '#FFFFFF',
                  cursor:
                    'pointer',
                  fontSize: 18,
                  marginRight: 4,
                }}
              >
                ⦿
              </button>
            </div>

            {/* CONNECTING LINE */}

            <div
              style={{
                position:
                  'absolute',
                left: 28,
                top: 49,
                width: 2,
                height: 35,
                backgroundColor:
                  '#41586D',
              }}
            />

            {/* DESTINATION INPUT */}

            <div
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                height: 55,
              }}
            >
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius:
                    '50%',
                  backgroundColor:
                    '#FF4D58',
                  margin:
                    '0 12px',
                  flexShrink: 0,
                }}
              />

              <input
                value={
                  destinationText
                }
                onFocus={() => {
                  setActiveInput(
                    'destination'
                  );

                  setSuggestions([]);
                }}
                onChange={(
                  event
                ) => {
                  const value =
                    event.target.value;

                  setDestinationText(
                    value
                  );

                  setDestinationCoordinate(
                    null
                  );

                  searchPlaces(
                    value,
                    'destination'
                  );
                }}
                placeholder="Search destination"
                style={{
                  flex: 1,
                  border:
                    'none',
                  outline:
                    'none',
                  background:
                    'transparent',
                  color:
                    '#FFFFFF',
                  fontSize: 15,
                  padding:
                    '8px 0',
                }}
              />

              {destinationText && (
                <button
                  onClick={
                    clearDestination
                  }
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius:
                      '50%',
                    border:
                      'none',
                    background:
                      'transparent',
                    color:
                      '#8292A2',
                    cursor:
                      'pointer',
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* SWAP */}

            <button
              onClick={
                swapLocations
              }
              title="Swap locations"
              style={{
                position:
                  'absolute',
                right: 19,
                top: 61,
                width: 28,
                height: 28,
                borderRadius:
                  '50%',
                border:
                  '1px solid #40576B',
                backgroundColor:
                  '#1A2C3E',
                color:
                  '#FFFFFF',
                cursor:
                  'pointer',
                fontSize: 14,
                zIndex: 5,
              }}
            >
              ↕
            </button>
          </div>

          {/* ================================================== */}
          {/* PLACE SUGGESTIONS */}
          {/* ================================================== */}

          {suggestions.length >
            0 && (
            <div
              style={{
                marginTop: 8,
                backgroundColor:
                  'rgba(5,15,26,0.99)',
                border:
                  '1px solid #263B4F',
                borderRadius:
                  17,
                overflow:
                  'hidden',
                boxShadow:
                  '0 14px 35px rgba(0,0,0,0.4)',
              }}
            >
              {suggestions.map(
                (
                  suggestion
                ) => (
                  <button
                    key={
                      suggestion.placeId
                    }
                    onClick={() =>
                      selectPlace(
                        suggestion
                      )
                    }
                    style={{
                      width:
                        '100%',
                      minHeight:
                        65,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      border:
                        'none',
                      borderBottom:
                        '1px solid #172B3D',
                      background:
                        'transparent',
                      color:
                        '#FFFFFF',
                      cursor:
                        'pointer',
                      textAlign:
                        'left',
                      padding:
                        '8px 15px',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius:
                          '50%',
                        backgroundColor:
                          '#132538',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        marginRight:
                          12,
                        fontSize:
                          17,
                      }}
                    >
                      ⌖
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color:
                            '#FFFFFF',
                          fontSize:
                            14,
                          fontWeight:
                            600,
                        }}
                      >
                        {
                          suggestion.primaryText
                        }
                      </div>

                      <div
                        style={{
                          color:
                            '#8293A5',
                          fontSize:
                            11,
                          marginTop:
                            4,
                          whiteSpace:
                            'nowrap',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                        }}
                      >
                        {
                          suggestion.secondaryText
                        }
                      </div>
                    </div>
                  </button>
                )
              )}

              <div
                style={{
                  padding:
                    '8px 14px',
                  color:
                    '#7E91A4',
                  fontSize:
                    9,
                  textAlign:
                    'right',
                }}
              >
                Powered by Google
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================== */}
      {/* LOCATION LOADING */}
      {/* ====================================================== */}

      {locationLoading && (
        <div
          style={{
            position:
              'absolute',
            top: 230,
            left: '50%',
            transform:
              'translateX(-50%)',
            zIndex: 30,
            padding:
              '9px 15px',
            borderRadius:
              12,
            backgroundColor:
              'rgba(5,11,20,0.94)',
            color:
              '#FFFFFF',
            fontSize: 11,
          }}
        >
          Getting your location...
        </div>
      )}

      {/* ====================================================== */}
      {/* ROUTE RESULT / FIND ROUTE */}
      {/* ====================================================== */}

      {!rideStarted && (
        <div
          style={{
            position:
              'absolute',
            left: '50%',
            transform:
              'translateX(-50%)',
            bottom: 90,
            width:
              'min(620px, calc(100% - 36px))',
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor:
                'rgba(5,11,20,0.97)',
              border:
                '1px solid #263B4F',
              borderRadius:
                22,
              padding:
                18,
              boxShadow:
                '0 -10px 30px rgba(0,0,0,0.25)',
            }}
          >
            {routeReady ? (
              <>
                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'flex-end',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color:
                          '#8092A5',
                        fontSize:
                          9,
                        fontWeight:
                          800,
                        letterSpacing:
                          1,
                      }}
                    >
                      MOTORCYCLE ROUTE
                    </div>

                    <div
                      style={{
                        color:
                          '#FFFFFF',
                        fontSize:
                          28,
                        fontWeight:
                          800,
                        marginTop:
                          3,
                      }}
                    >
                      {routeMinutes}{' '}
                      min
                    </div>
                  </div>

                  <div
                    style={{
                      color:
                        '#FFFFFF',
                      fontSize:
                        16,
                      fontWeight:
                        700,
                    }}
                  >
                    {routeDistance.toFixed(
                      1
                    )}{' '}
                    km
                  </div>
                </div>

                <button
                  onClick={
                    startRide
                  }
                  style={{
                    width:
                      '100%',
                    height:
                      52,
                    marginTop:
                      15,
                    border:
                      'none',
                    borderRadius:
                      15,
                    backgroundColor:
                      '#0875F5',
                    color:
                      '#FFFFFF',
                    fontSize:
                      12,
                    fontWeight:
                      800,
                    letterSpacing:
                      0.7,
                    cursor:
                      'pointer',
                  }}
                >
                  START RIDE →
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    color:
                      '#FFFFFF',
                    fontSize:
                      14,
                    fontWeight:
                      800,
                  }}
                >
                  WHERE ARE YOU GOING?
                </div>

                <div
                  style={{
                    color:
                      '#8495A7',
                    fontSize:
                      11,
                    marginTop:
                      6,
                    lineHeight:
                      1.5,
                  }}
                >
                  Enter your starting point and
                  destination above to see the
                  motorcycle route.
                </div>

                <button
                  onClick={
                    findRoute
                  }
                  disabled={
                    searching ||
                    !startCoordinate ||
                    !destinationCoordinate
                  }
                  style={{
                    width:
                      '100%',
                    height:
                      52,
                    marginTop:
                      14,
                    border:
                      'none',
                    borderRadius:
                      15,
                    backgroundColor:
                      '#0875F5',
                    opacity:
                      searching ||
                      !startCoordinate ||
                      !destinationCoordinate
                        ? 0.45
                        : 1,
                    color:
                      '#FFFFFF',
                    fontSize:
                      12,
                    fontWeight:
                      800,
                    letterSpacing:
                      0.7,
                    cursor:
                      'pointer',
                  }}
                >
                  {searching
                    ? 'CALCULATING ROUTE...'
                    : 'FIND MOTORCYCLE ROUTE →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* NAVIGATION MODE */}
      {/* ====================================================== */}

      {rideStarted && (
        <>
          <div
            style={{
              position:
                'absolute',
              top: 22,
              left: 22,
              right: 22,
              zIndex: 30,
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'space-between',
            }}
          >
            <button
              onClick={() =>
                setRideStarted(
                  false
                )
              }
              style={{
                width: 44,
                height: 44,
                borderRadius:
                  '50%',
                border:
                  '1px solid #293C4E',
                backgroundColor:
                  'rgba(5,11,20,0.94)',
                color:
                  '#FFFFFF',
                fontSize: 22,
                cursor:
                  'pointer',
              }}
            >
              ←
            </button>

            <div
              style={{
                color:
                  '#FFFFFF',
                fontSize:
                  14,
                fontWeight:
                  800,
                letterSpacing:
                  1.5,
              }}
            >
              NAVIGATION
            </div>

            <button
              onClick={
                useMyLocation
              }
              style={{
                width: 44,
                height: 44,
                borderRadius:
                  '50%',
                border:
                  '1px solid #293C4E',
                backgroundColor:
                  'rgba(5,11,20,0.94)',
                color:
                  '#FFFFFF',
                fontSize:
                  20,
                cursor:
                  'pointer',
              }}
            >
              ⦿
            </button>
          </div>

          <div
            style={{
              position:
                'absolute',
              top: 82,
              left: '50%',
              transform:
                'translateX(-50%)',
              width:
                'min(620px, calc(100% - 36px))',
              zIndex: 25,
            }}
          >
            <div
              style={{
                backgroundColor:
                  'rgba(5,15,26,0.97)',
                border:
                  '1px solid #263B4F',
                borderRadius:
                  20,
                padding:
                  18,
                display:
                  'flex',
                alignItems:
                  'center',
              }}
            >
              <div
                style={{
                  fontSize:
                    38,
                  marginRight:
                    15,
                }}
              >
                →
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    color:
                      '#FFFFFF',
                    fontSize:
                      23,
                    fontWeight:
                      800,
                  }}
                >
                  Continue on route
                </div>

                <div
                  style={{
                    color:
                      '#8A9CAD',
                    fontSize:
                      11,
                    marginTop:
                      5,
                  }}
                >
                  Motorcycle route
                </div>
              </div>

              <div
                style={{
                  textAlign:
                    'right',
                }}
              >
                <div
                  style={{
                    color:
                      '#16E6A2',
                    fontSize:
                      13,
                    fontWeight:
                      800,
                  }}
                >
                  {routeMinutes}{' '}
                  min
                </div>

                <div
                  style={{
                    color:
                      '#FFFFFF',
                    fontSize:
                      12,
                    marginTop:
                      4,
                  }}
                >
                  {routeDistance.toFixed(
                    1
                  )}{' '}
                  km
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setRideStarted(
                false
              )
            }
            style={{
              position:
                'absolute',
              bottom: 90,
              left: '50%',
              transform:
                'translateX(-50%)',
              width:
                'min(620px, calc(100% - 36px))',
              height: 56,
              zIndex: 30,
              border:
                '1px solid #394D60',
              borderRadius:
                30,
              backgroundColor:
                'rgba(20,34,49,0.97)',
              color:
                '#FF4D42',
              fontSize:
                13,
              fontWeight:
                800,
              cursor:
                'pointer',
            }}
          >
            END RIDE
          </button>
        </>
      )}

      {/* ====================================================== */}
      {/* MAP ERROR */}
      {/* ====================================================== */}

      {mapError && (
        <div
          style={{
            position:
              'absolute',
            top: '50%',
            left: '50%',
            transform:
              'translate(-50%, -50%)',
            width:
              'min(90%, 500px)',
            padding:
              22,
            borderRadius:
              18,
            backgroundColor:
              'rgba(5,11,20,0.97)',
            border:
              '1px solid #5A2830',
            color:
              '#FFFFFF',
            textAlign:
              'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontSize:
                18,
              fontWeight:
                700,
              marginBottom:
                10,
            }}
          >
            Unable to load map
          </div>

          <div
            style={{
              color:
                '#AEBBC8',
              fontSize:
                13,
              lineHeight:
                1.6,
            }}
          >
            {mapError}
          </div>
        </div>
      )}
    </div>
  );
}