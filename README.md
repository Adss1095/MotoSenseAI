# MotoSense AI 🏍️🤖

> **Automotive-Based Rider Assistance System**  
> A modular AI + IoT safety platform designed to provide real-time assistance to two-wheeler riders using computer vision, proximity sensing, weather awareness, adaptive rider analysis, and emergency SOS monitoring.

## Overview

MotoSense AI combines a Raspberry Pi-based sensing and AI backend with an Expo/React Native mobile application and an Arduino-based rear safety module.

The current implementation brings together:

- **Front camera perception** using OpenCV and YOLO11n
- **Object tracking and danger-level assessment**
- **Front HC-SR04 ultrasonic collision sensing**
- **Rear HC-SR04 ultrasonic sensing through Arduino**
- **Visual proximity alerts using LEDs**
- **Buzzer-based rear proximity warning**
- **SOS detection with PENDING and ACTIVE states**
- **Camera-based weather/risk estimation**
- **Raspberry Pi device-temperature monitoring**
- **Adaptive rider-behaviour modelling**
- **Flask REST API + live video streaming**
- **Expo / React Native mobile dashboard**
- **Alert history and active-alert tracking**

## System Architecture

```
                    ┌──────────────────────────┐
                    │       Mobile App         │
                    │  Expo / React Native     │
                    │ Dashboard • Alerts       │
                    │ Settings • SOS • Profile │
                    └────────────┬─────────────┘
                                 │ HTTP
                                 ▼
                    ┌──────────────────────────┐
                    │     Flask Backend        │
                    │      Raspberry Pi        │
                    ├──────────────────────────┤
                    │ YOLO11n / Tracking       │
                    │ Front Ultrasonic         │
                    │ Weather Detection        │
                    │ Rider Model              │
                    │ Alert History            │
                    │ SOS Processing           │
                    └───────┬─────────┬────────┘
                            │         │
                   Camera / GPIO     Serial
                            │         │
                            ▼         ▼
                    ┌───────────┐  ┌──────────────┐
                    │ Front     │  │ Arduino UNO  │
                    │ Camera    │  │ Rear HC-SR04 │
                    │ + HC-SR04 │  │ LEDs+Buzzer  │
                    └───────────┘  │ SOS Logic    │
                                   └──────────────┘
```

## Core Features

### 1. AI-Based Front Object Detection

The Raspberry Pi camera feeds frames to the YOLO11n detector. The backend tracks detected objects and exposes information such as:

- Detected object
- Track ID
- Confidence
- Bounding box
- Object count
- Object position
- Bounding-box area ratio
- AI danger level

The front safety decision combines the AI result with the front ultrasonic measurement.

### 2. Front Collision Detection

The Raspberry Pi reads a front HC-SR04 sensor and classifies proximity into:

- **GREEN** — normal
- **YELLOW** — warning
- **RED** — danger

The front fusion layer combines YOLO danger and ultrasonic danger. A RED condition from either source produces a front collision state.

The front red LED is activated for a RED condition.

> Front detection does **not** trigger the SOS system.

### 3. Rear Proximity Detection

The rear safety module uses an Arduino UNO with an HC-SR04 sensor.

The Arduino controls:

- Green LEDs
- Yellow LEDs
- Red LEDs
- Buzzer

As an approaching object gets closer, the warning indicators progressively activate.

### 4. Emergency SOS

The rear proximity module includes a timed SOS mechanism.

When the measured rear distance becomes less than 5 cm:

1. Both red LEDs activate.
2. The buzzer activates.
3. The system starts an SOS timer.
4. After approximately **5 seconds**, `SOS_PENDING` is sent.
5. After approximately **10 seconds**, `SOS_ACTIVE` is sent.

The backend treats PENDING → ACTIVE as a single SOS event and tracks its duration until the state returns to NORMAL.

SOS can also be controlled through backend API endpoints.

### 5. Weather & Environmental Risk

MotoSense AI includes a lightweight camera-based weather detector.

It currently identifies:

- **CLEAR**
- **SLIGHT_RAIN**
- **HEAVY_RAIN**
- **FOG**

The detector uses image statistics, contrast, edge density, and frame-to-frame motion analysis.

It also reads the **Raspberry Pi device temperature** and can report a caution state when the device temperature is high.

> The device-temperature value represents Raspberry Pi temperature; it is not outdoor ambient temperature.

The mobile app can additionally retrieve ambient weather data through Open-Meteo using the rider's latitude and longitude.

### 6. Adaptive Rider Behaviour Model

The backend includes a rider-behaviour model that currently uses simulated telemetry for development.

The model generates:

- Speed
- Braking intensity
- Acceleration
- Reaction time
- Rider profile
- Adaptive factor

Profiles currently include:

- `CAUTIOUS`
- `RESPONSIVE`
- `NORMAL`

The rider model is explicitly structured as a temporary/mock component intended to be replaced with real rider telemetry.

### 7. Alert History

The backend maintains an in-memory alert history for:

- Front warnings
- Front danger events
- Rear warnings
- Rear danger events
- SOS events

For each alert category it tracks:

- Event count
- Total duration
- Active state
- Start time
- End time
- Event duration

The history is intentionally kept in RAM and resets when the backend restarts.

## Technology Stack

### Backend

- Python
- Flask
- Flask-CORS
- OpenCV
- Ultralytics YOLO
- PyTorch
- NumPy
- PySerial
- Raspberry Pi GPIO
- Picamera2

### AI / Computer Vision

- **YOLO11n** for object detection
- OpenCV for image processing
- Object tracking
- Image-statistics-based weather analysis

### Hardware

- Raspberry Pi 4B
- Raspberry Pi camera
- HC-SR04 ultrasonic sensor(s)
- Arduino UNO
- LEDs
- Buzzer
- GPIO / serial communication

### Mobile

- Expo
- React Native
- Expo Router
- TypeScript
- React Navigation
- React Native Maps
- AsyncStorage
- Three.js / React Three Fiber components

## Repository Structure

```text
MotoSenseAI/
│
├── backend/
│   ├── ai/
│   │   ├── danger.py
│   │   └── detector.py
│   │
│   ├── camera/
│   │   └── camera.py
│   │
│   ├── sensors/
│   │   ├── arduino.py
│   │   └── pi_ultrasonic.py
│   │
│   ├── safety/
│   ├── adaptive.py
│   ├── app.py
│   ├── config.py
│   ├── rider_model.py
│   ├── weather.py
│   └── requirements.txt
│
├── arduino/
│   └── motosense_rear/
│       └── motosense_back_arduino/
│           └── sketch_aug23a/
│               └── sketch_aug23a.ino
│
├── mobile/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── alerts.tsx
│   │   │   ├── explore.tsx
│   │   │   └── settings.tsx
│   │   ├── alert-details.tsx
│   │   ├── connected-bike.tsx
│   │   ├── emergency-contacts.tsx
│   │   ├── login.tsx
│   │   ├── notifications.tsx
│   │   ├── rider-profile.tsx
│   │   └── sos-settings.tsx
│   │
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── services/
│   ├── assets/
│   ├── package.json
│   └── app.json
│
└── .gitignore
```

## Backend Setup

### Hardware Target

The backend configuration targets:

- **Raspberry Pi 4B**
- Camera input
- GPIO-connected front ultrasonic sensor
- Serial-connected Arduino rear module

### 1. Clone the repository

```bash
git clone https://github.com/Adss1095/MotoSenseAI.git
cd MotoSenseAI
```

### 2. Create a Python environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

The backend requirements currently include Flask, Flask-CORS, PySerial, NumPy, OpenCV, Picamera2, Ultralytics, PyTorch, and Torchvision.

### 4. YOLO model

The backend configuration expects:

```text
backend/yolo11n.pt
```

The configured model name is **YOLO11n**.

### 5. Configure the Arduino serial port

The configuration supports the environment variable:

```bash
MOTOSENSE_ARDUINO_PORT
```

The default configured value in `config.py` is:

```text
/dev/ttyACM0
```

The current backend integration in `app.py` initializes the Arduino manager with `/dev/ttyUSB0`, so verify the actual serial device used by your hardware before running the system.

### 6. Run the backend

```bash
python app.py
```

The backend is configured for:

```text
Host: 0.0.0.0
Port: 5000
```

## Mobile App Setup

The mobile client is an Expo application using Expo Router.

### 1. Enter the mobile directory

```bash
cd mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend address

Open:

```text
mobile/services/api.ts
```

Update:

```ts
export const BACKEND_URL =
  "http://YOUR_RASPBERRY_PI_IP:5000";
```

Replace `YOUR_RASPBERRY_PI_IP` with the IP address of the Raspberry Pi running the Flask backend.

### 4. Start Expo

```bash
npx expo start
```

Available project scripts include:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Backend API

The mobile client currently communicates with endpoints including:

| Endpoint | Purpose |
|---|---|
| `/api/front` | Front safety state |
| `/api/rear` | Rear sensor / SOS state |
| `/api/weather` | Camera-based weather state |
| `/api/alerts/history` | Alert history |
| `/api/sos/cancel` | Cancel SOS |
| `/api/rear/sos/cancel` | Cancel rear SOS |
| `/api/sos/test` | Test SOS |
| `/api/sos/activate` | Activate SOS |
| `/video` | Live video stream |

The app also retrieves ambient weather from the Open-Meteo API.

## Safety-State Logic

### Front

```text
YOLO + Front Ultrasonic
          │
          ▼
     Safety Fusion
          │
     ┌────┼────┐
     ▼    ▼    ▼
   GREEN YELLOW RED
                │
                ▼
      Forward Collision
```

### Rear + SOS

```text
Rear Distance
     │
     ├── > 30 cm ─────► Normal
     │
     ├── 30–5 cm ─────► Proximity Warning
     │
     └── < 5 cm ──────► Critical
                            │
                            ├── 5 s  → SOS_PENDING
                            │
                            └── 10 s → SOS_ACTIVE
```

## Hardware Notes

### Front Raspberry Pi GPIO

The current backend configuration defines:

| Function | BCM GPIO |
|---|---:|
| Front HC-SR04 Trigger | 23 |
| Front HC-SR04 Echo | 24 |
| Front Red LED | 25 |

### Rear Arduino Pins

The current Arduino sketch defines:

| Function | Arduino Pin |
|---|---:|
| HC-SR04 Trigger | 2 |
| HC-SR04 Echo | 3 |
| Green LEDs | 4, 5 |
| Yellow LEDs | 6, 7 |
| Red LEDs | 8, 9 |
| Buzzer | 10 |

The Arduino communicates at **115200 baud**.

## Current Development Status

MotoSense AI is an active development project. Some modules are hardware-integrated while others are still development-oriented.

The current codebase includes a **mock rider-behaviour model**, and the weather detector uses lightweight image-analysis heuristics rather than a dedicated trained weather-classification model.

Before deploying the system on a real vehicle, validate sensor wiring, GPIO voltage levels, serial-device configuration, camera availability, network configuration, and the safety behaviour of all alerts under controlled conditions.

## Roadmap

Planned directions for the platform include:

- Replace simulated rider telemetry with real IMU/GPS/speed/braking data
- Improve weather classification with a dedicated trained model
- Expand multi-object and trajectory-aware collision prediction
- Improve sensor fusion and calibration
- Add persistent event storage
- Improve edge-device performance and model optimization
- Strengthen connectivity and offline behaviour
- Integrate additional rider and vehicle telemetry
- Develop more robust emergency-notification workflows

## Project Intent

MotoSense AI is intended as a modular research and engineering platform for exploring how **AI, computer vision, embedded systems, sensors, and mobile applications** can be combined into a two-wheeler rider-assistance system.

It is not a substitute for certified automotive safety equipment or a guarantee of accident prevention.

## License

No license file is currently present in the repository. Until a license is added, the repository should not be assumed to grant broad permission to copy, modify, or redistribute the code.

---

**MotoSense AI** — *Intelligent sensing for safer two-wheeler riding.* 🏍️
