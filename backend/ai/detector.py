"""
MotoSense AI
AI Object Detection Module

Phase 2:
Raspberry Pi Camera Module 3 + YOLO11n

Responsibilities:
- Start Raspberry Pi Camera
- Load YOLO11n model
- Run object detection
- Track the highest-confidence detected object
- Provide the latest AI state to the Flask backend
"""

import os
import time
import threading

from picamera2 import Picamera2
from ultralytics import YOLO


# ============================================================
# PATH CONFIGURATION
# ============================================================

# detector.py is located at:
# MotoSenseAI/backend/ai/detector.py
#
# YOLO model is located at:
# MotoSenseAI/backend/yolo11n.pt

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "yolo11n.pt"
)


# ============================================================
# DETECTION CONFIGURATION
# ============================================================

CONFIDENCE = 0.30

CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480

IMAGE_SIZE = 320


# ============================================================
# AI STATE
# ============================================================

AI_STATE = {
    "running": False,
    "status": "STARTING",
    "object": None,
    "confidence": None,
    "timestamp": None,
}

AI_STATE_LOCK = threading.Lock()


# ============================================================
# YOLO DETECTOR
# ============================================================

class YOLODetector:

    def __init__(self):

        self.camera = None
        self.model = None

        self.running = False
        self.thread = None

    # ========================================================
    # START DETECTOR
    # ========================================================

    def start(self):

        if self.running:
            return

        try:

            print("Starting camera...")

            # ------------------------------------------------
            # INITIALIZE CAMERA
            # ------------------------------------------------

            self.camera = Picamera2()

            self.camera.configure(
                self.camera.create_preview_configuration(
                    main={
                        "size": (
                            CAMERA_WIDTH,
                            CAMERA_HEIGHT
                        ),
                        "format": "RGB888",
                    }
                )
            )

            self.camera.start()

            print("Camera started.")

            # ------------------------------------------------
            # LOAD YOLO MODEL
            # ------------------------------------------------

            print(
                f"Loading YOLO model: {MODEL_PATH}"
            )

            if not os.path.exists(MODEL_PATH):

                raise FileNotFoundError(
                    f"YOLO model not found: {MODEL_PATH}"
                )

            self.model = YOLO(
                MODEL_PATH
            )

            print("YOLO model loaded.")

            # ------------------------------------------------
            # START DETECTION
            # ------------------------------------------------

            self.running = True

            with AI_STATE_LOCK:

                AI_STATE["running"] = True
                AI_STATE["status"] = "RUNNING"
                AI_STATE["object"] = None
                AI_STATE["confidence"] = None
                AI_STATE["timestamp"] = time.time()

            self.thread = threading.Thread(
                target=self._detection_loop,
                daemon=True
            )

            self.thread.start()

            print("YOLO detection started.")

        except Exception as error:

            self.running = False

            with AI_STATE_LOCK:

                AI_STATE["running"] = False
                AI_STATE["status"] = "ERROR"
                AI_STATE["object"] = None
                AI_STATE["confidence"] = None
                AI_STATE["timestamp"] = time.time()

            print(
                f"YOLO startup error: {error}"
            )

    # ========================================================
    # DETECTION LOOP
    # ========================================================

    def _detection_loop(self):

        while self.running:

            try:

                # ------------------------------------------------
                # CAPTURE FRAME
                # ------------------------------------------------

                frame = self.camera.capture_array()

                # ------------------------------------------------
                # RUN YOLO
                # ------------------------------------------------

                results = self.model(
                    frame,
                    conf=CONFIDENCE,
                    imgsz=IMAGE_SIZE,
                    verbose=False
                )

                detected_object = None
                detected_confidence = None

                # ------------------------------------------------
                # FIND HIGHEST-CONFIDENCE OBJECT
                # ------------------------------------------------

                for result in results:

                    if result.boxes is None:
                        continue

                    for box in result.boxes:

                        confidence = float(
                            box.conf[0]
                        )

                        if (
                            detected_confidence is None
                            or
                            confidence > detected_confidence
                        ):

                            class_id = int(
                                box.cls[0]
                            )

                            detected_object = (
                                self.model.names[class_id]
                            )

                            detected_confidence = round(
                                confidence,
                                3
                            )

                # ------------------------------------------------
                # UPDATE AI STATE
                # ------------------------------------------------

                with AI_STATE_LOCK:

                    AI_STATE["running"] = True

                    if detected_object:

                        AI_STATE["status"] = (
                            "OBJECT_DETECTED"
                        )

                    else:

                        AI_STATE["status"] = "CLEAR"

                    AI_STATE["object"] = (
                        detected_object
                    )

                    AI_STATE["confidence"] = (
                        detected_confidence
                    )

                    AI_STATE["timestamp"] = (
                        time.time()
                    )

            except Exception as error:

                with AI_STATE_LOCK:

                    AI_STATE["running"] = False

                    AI_STATE["status"] = "ERROR"

                    AI_STATE["object"] = None

                    AI_STATE["confidence"] = None

                    AI_STATE["timestamp"] = (
                        time.time()
                    )

                print(
                    f"YOLO detection error: {error}"
                )

                time.sleep(1)

    # ========================================================
    # GET CURRENT AI STATE
    # ========================================================

    def get_state(self):

        with AI_STATE_LOCK:

            return AI_STATE.copy()

    # ========================================================
    # STOP DETECTOR
    # ========================================================

    def stop(self):

        self.running = False

        if self.thread:

            self.thread.join(
                timeout=2
            )

            self.thread = None

        if self.camera:

            try:

                self.camera.stop()

            except Exception as error:

                print(
                    f"Camera stop error: {error}"
                )

            self.camera = None

        with AI_STATE_LOCK:

            AI_STATE["running"] = False
            AI_STATE["status"] = "STOPPED"
            AI_STATE["object"] = None
            AI_STATE["confidence"] = None
            AI_STATE["timestamp"] = time.time()

        print("YOLO detection stopped.")