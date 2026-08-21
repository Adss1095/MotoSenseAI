"""
MotoSense AI
Central configuration
"""

import os


PROJECT_NAME = "MotoSense AI"
VERSION = "2.0.0"
PLATFORM = "Raspberry Pi 4B"

HOST = "0.0.0.0"
PORT = 5000


# ============================================================
# CAMERA
# ============================================================

CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480

YOLO_MODEL = os.path.join(
    os.path.dirname(__file__),
    "yolo11n.pt"
)

YOLO_CONFIDENCE = 0.30
YOLO_IMAGE_SIZE = 320


# ============================================================
# FRONT ULTRASONIC
# BCM GPIO NUMBERS
# ============================================================

FRONT_TRIG_PIN = 23
FRONT_ECHO_PIN = 24

# Only one front LED
FRONT_RED_LED_PIN = 25


# ============================================================
# FRONT COLLISION
# ============================================================

FRONT_RED_DISTANCE = 1.5


# ============================================================
# ADAPTIVE RIDER MODEL
# ============================================================

BASE_GREEN_DISTANCE = 3.0
BASE_YELLOW_DISTANCE = 2.0
BASE_RED_DISTANCE = 1.2


# ============================================================
# ARDUINO
# ============================================================

ARDUINO_PORT = os.getenv(
    "MOTOSENSE_ARDUINO_PORT",
    "/dev/ttyACM0"
)

ARDUINO_BAUDRATE = 115200


# ============================================================
# SOS
# ============================================================

SOS_CRITICAL_SECONDS = 10.0