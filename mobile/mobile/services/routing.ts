export type RouteCoordinates = {
  latitude: number;
  longitude: number;
};

export type RouteManeuver = {
  instruction: string;
  streetName: string;
  distanceKm: number;
  type: number;
};

export type MotorcycleRoute = {
  points: RouteCoordinates[];
  distanceKm: number;
  durationMinutes: number;
  maneuvers: RouteManeuver[];
};

/*
 * ============================================================
 * VALHALLA SERVER
 * ============================================================
 */

const VALHALLA_URL =
  'https://valhalla1.openstreetmap.de/route';

/*
 * ============================================================
 * CALCULATE MOTORCYCLE ROUTE
 * ============================================================
 */

export async function calculateMotorcycleRoute(
  start: {
    lat: number;
    lon: number;
  },
  destination: {
    lat: number;
    lon: number;
  },
): Promise<MotorcycleRoute> {
  /*
   * ----------------------------------------------------------
   * REQUEST
   * ----------------------------------------------------------
   */

  const request = {
  locations: [
    {
      lat: start.lat,
      lon: start.lon,
      type: 'break',
    },
    {
      lat: destination.lat,
      lon: destination.lon,
      type: 'break',
    },
  ],

  costing: 'motorcycle',

  units: 'kilometers',

  directions_options: {
    units: 'kilometers',
    language: 'en-US',
  },
};
  /*
   * ----------------------------------------------------------
   * CALL VALHALLA
   *
   * IMPORTANT:
   * We use POST instead of GET.
   * ----------------------------------------------------------
   */

  const response = await fetch(
    VALHALLA_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',

        /*
         * Identifies our application to
         * the public Valhalla server.
         */

        'X-Client-Id':
          'MotoSenseAI',
      },

      body: JSON.stringify(request),
    },
  );

  /*
   * ----------------------------------------------------------
   * HANDLE HTTP ERROR
   * ----------------------------------------------------------
   */

  if (!response.ok) {
    let errorMessage =
      `Valhalla routing failed (${response.status}).`;

    try {
      const errorData =
        await response.json();

      if (
        errorData?.error
      ) {
        errorMessage +=
          ` ${errorData.error}`;
      }

      if (
        errorData?.status_message
      ) {
        errorMessage +=
          ` ${errorData.status_message}`;
      }
    } catch {
      /*
       * Ignore JSON parsing errors.
       */
    }

    throw new Error(
      errorMessage,
    );
  }

  /*
   * ----------------------------------------------------------
   * READ RESPONSE
   * ----------------------------------------------------------
   */

  const data =
    await response.json();

  /*
   * ----------------------------------------------------------
   * CHECK VALHALLA STATUS
   * ----------------------------------------------------------
   */

  if (
    data?.status !== undefined &&
    data.status !== 0
  ) {
    throw new Error(
      data?.status_message ||
        data?.error ||
        'Valhalla could not calculate the route.',
    );
  }

  /*
   * ----------------------------------------------------------
   * GET FIRST LEG
   * ----------------------------------------------------------
   */

  const leg =
    data?.trip?.legs?.[0];

  if (!leg) {
    throw new Error(
      'Valhalla did not return a route.',
    );
  }

  /*
   * ----------------------------------------------------------
   * CHECK ROUTE SHAPE
   * ----------------------------------------------------------
   */

  if (
    typeof leg.shape !== 'string' ||
    leg.shape.length === 0
  ) {
    throw new Error(
      'Valhalla did not return route geometry.',
    );
  }

  /*
   * ----------------------------------------------------------
   * DECODE ROUTE
   *
   * Valhalla uses polyline6.
   * ----------------------------------------------------------
   */

  const points =
    decodePolyline6(
      leg.shape,
    );

  if (points.length < 2) {
    throw new Error(
      'The route did not contain enough road points.',
    );
  }

  /*
   * ----------------------------------------------------------
   * ROUTE SUMMARY
   * ----------------------------------------------------------
   */

  const summary =
    data?.trip?.summary ??
    leg?.summary ??
    {};

  const distanceKm =
    Number(
      summary.length ?? 0,
    );

  const durationSeconds =
    Number(
      summary.time ?? 0,
    );

  const durationMinutes =
    Math.max(
      1,
      Math.round(
        durationSeconds / 60,
      ),
    );

  /*
   * ----------------------------------------------------------
   * MANEUVERS
   * ----------------------------------------------------------
   */

  const rawManeuvers =
    Array.isArray(
      leg.maneuvers,
    )
      ? leg.maneuvers
      : [];

  const maneuvers: RouteManeuver[] =
    rawManeuvers.map(
      (maneuver: any) => ({
        /*
         * Example:
         * "Turn right onto Kasturba Road."
         */

        instruction:
          typeof maneuver.instruction ===
          'string'
            ? maneuver.instruction
            : 'Continue',

        /*
         * Valhalla provides street_names
         * as an array.
         */

        streetName:
          Array.isArray(
            maneuver.street_names,
          )
            ? maneuver.street_names.join(
                ' / ',
              )
            : '',

        /*
         * Distance for this maneuver.
         */

        distanceKm:
          Number(
            maneuver.length ?? 0,
          ),

        /*
         * Valhalla maneuver type.
         */

        type:
          Number(
            maneuver.type ?? 0,
          ),
      }),
    );

  /*
   * ----------------------------------------------------------
   * RETURN ROUTE
   * ----------------------------------------------------------
   */

  return {
    points,

    distanceKm,

    durationMinutes,

    maneuvers,
  };
}

/*
 * ============================================================
 * VALHALLA POLYLINE6 DECODER
 * ============================================================
 */

function decodePolyline6(
  encoded: string,
): RouteCoordinates[] {
  const coordinates:
    RouteCoordinates[] = [];

  let index = 0;

  let latitude = 0;

  let longitude = 0;

  while (
    index < encoded.length
  ) {
    /*
     * --------------------------------------------------------
     * LATITUDE
     * --------------------------------------------------------
     */

    let result = 0;

    let shift = 0;

    let byte: number;

    do {
      byte =
        encoded.charCodeAt(
          index++,
        ) - 63;

      result |=
        (byte & 0x1f) <<
        shift;

      shift += 5;
    } while (
      byte >= 0x20
    );

    const deltaLatitude =
      result & 1
        ? ~(result >> 1)
        : result >> 1;

    latitude +=
      deltaLatitude;

    /*
     * --------------------------------------------------------
     * LONGITUDE
     * --------------------------------------------------------
     */

    result = 0;

    shift = 0;

    do {
      byte =
        encoded.charCodeAt(
          index++,
        ) - 63;

      result |=
        (byte & 0x1f) <<
        shift;

      shift += 5;
    } while (
      byte >= 0x20
    );

    const deltaLongitude =
      result & 1
        ? ~(result >> 1)
        : result >> 1;

    longitude +=
      deltaLongitude;

    /*
     * --------------------------------------------------------
     * SAVE COORDINATE
     * --------------------------------------------------------
     */

    coordinates.push({
      latitude:
        latitude / 1000000,

      longitude:
        longitude / 1000000,
    });
  }

  return coordinates;
}