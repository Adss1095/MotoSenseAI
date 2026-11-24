// ============================================================
// MotoSense AI
// Frontend API Service
// ============================================================

/*
 * IMPORTANT
 * ----------
 * Change this IP to the Raspberry Pi IP address.
 *
 * Example:
 * http://192.168.1.100:5000
 */

export const BACKEND_URL =
  "http://10.220.253.176:5000";
  
// ============================================================
// TYPES
// ============================================================

export type FrontState = {
  status?: string;
  danger_level?: string;

  object?: string | null;
  track_id?: number | null;
  confidence?: number | null;

  box?: number[] | null;
  box_area_ratio?: number;

  center_x?: number | null;
  center_y?: number | null;

  object_count?: number;
  objects?: any[];

  distance_m?: number | null;

  yolo_danger?: string;
  ultrasonic_danger?: string;

  led?: boolean;

  sos?: boolean;

  weather?: WeatherState;

  timestamp?: number;
};


export type WeatherState = {
  running?: boolean;

  condition?: string;

  rain?: string;

  fog?: boolean;

  device_temperature_c?: number | null;

  risk?: string;

  warning?: string;

  timestamp?: number;
};


export type DashboardState = {
  front?: FrontState;

  weather?: WeatherState;

  connected?: boolean;

  timestamp?: number;
};


// ============================================================
// GENERIC GET
// ============================================================

async function apiGet<T>(
  endpoint: string
): Promise<T> {

  const response = await fetch(
    `${BACKEND_URL}${endpoint}`
  );

  if (!response.ok) {

    throw new Error(
      `Backend error: ${response.status}`
    );

  }

  return response.json();
}


// ============================================================
// GENERIC POST
// ============================================================

async function apiPost<T>(
  endpoint: string
): Promise<T> {

  const response = await fetch(
    `${BACKEND_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  if (!response.ok) {

    throw new Error(
      `Backend error: ${response.status}`
    );

  }

  return response.json();
}


// ============================================================
// FRONT SAFETY
// ============================================================

export async function getFrontState() {

  return apiGet<FrontState>(
    "/api/front"
  );

}

// ============================================================
// REAR ARDUINO
// ============================================================

export type RearState = {
  connected?: boolean;
  distance_m?: number | null;
  danger_level?: string;
  led_zone?: string;
  buzzer?: boolean;

  sos?: boolean;
  sos_status?: string;

  last_event?: string | null;
  timestamp?: number;
};


export async function getRearState() {

  return apiGet<RearState>(
    "/api/rear"
  );

}

// ============================================================
// TEMPORARY ALERT HISTORY
// ============================================================

export type AlertSummaryItem = {
  count: number;
  total_duration_s: number;
};

export type AlertHistoryEvent = {
  key: string;
  title: string;
  source: string;
  level: string;

  start_time: number;

  end_time: number | null;

  duration_s: number;
};

export type ActiveAlert = {
  key: string;
  title: string;
  source: string;
  level: string;

  start_time: number;

  duration_s: number;
};

export type AlertHistory = {
  summary: {
    front_warning: AlertSummaryItem;
    front_danger: AlertSummaryItem;

    rear_warning: AlertSummaryItem;
    rear_danger: AlertSummaryItem;

    sos: AlertSummaryItem;
  };

  events: AlertHistoryEvent[];

  active: ActiveAlert[];

  timestamp: number;
};


export async function getAlertHistory() {

  return apiGet<AlertHistory>(
    "/api/alerts/history"
  );

}


// ============================================================
// WEATHER
// ============================================================

export async function getWeatherState() {

  return apiGet<WeatherState>(
    "/api/weather"
  );

}


// ============================================================
// CAMERA / VIDEO
// ============================================================

export function getVideoUrl() {

  return `${BACKEND_URL}/video`;

}


// ============================================================
// SOS - CANCEL
// ============================================================

export async function cancelSOS() {

  return apiPost(
    "/api/sos/cancel"
  );

}

// ============================================================
// REAR ARDUINO SOS - CANCEL
// ============================================================

export async function cancelRearSOS() {

  return apiPost(
    "/api/rear/sos/cancel"
  );

}


// ============================================================
// SOS - TEST
// ============================================================

export async function testSOS() {

  return apiPost(
    "/api/sos/test"
  );

}


// ============================================================
// SOS - ACTIVATE
// ============================================================

export async function activateSOS() {

  return apiPost(
    "/api/sos/activate"
  );

}


// ============================================================
// BACKEND HEALTH CHECK
// ============================================================

export async function checkBackend() {

  try {

    await apiGet("/");

    return true;

  } catch {

    return false;

  }

}

// ============================================================
// AMBIENT WEATHER — OPEN-METEO
// ============================================================

export async function getAmbientWeather(
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,rain,precipitation&timezone=auto`
  );

  if (!response.ok) {
    throw new Error(
      `Weather API error: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    temperature: data.current?.temperature_2m ?? null,
    weatherCode: data.current?.weather_code ?? null,
    rain: data.current?.rain ?? 0,
    precipitation: data.current?.precipitation ?? 0,
  };
}