"""
MotoSense AI
YOLO Object Detection

Phase 2:
Raspberry Pi Camera Module 3 + YOLO

Only object detection is implemented here.
"""

import time
import threading

from picamera2 import Picamera2
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "yolo11n.pt"

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


    # --------------------------------------------------------
    # START
    # --------------------------------------------------------

    def start(self):

        if self.running:
            return

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

        self.model = YOLO(
            MODEL_PATH
        )

        self.running = True

        self.thread = threading.Thread(
            target=self._detection_loop,
            daemon=True
        )

        self.thread.start()


    # --------------------------------------------------------
    # DETECTION LOOP
    # --------------------------------------------------------

    def _detection_loop(self):

        global AI_STATE

        while self.running:

            try:

                frame = self.camera.capture_array()

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
                            confidence >
                            detected_confidence
                        ):

                            class_id = int(
                                box.cls[0]
                            )

                            detected_object = (
                                self.model
                                .names[class_id]
                            )

                            detected_confidence = (
                                round(
                                    confidence,
                                    3
                                )
                            )


                # ------------------------------------------------
                # UPDATE STATE
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
                    f"YOLO error: {error}"
                )

                time.sleep(1)


    # --------------------------------------------------------
    # STATE
    # --------------------------------------------------------

    def get_state(self):

        with AI_STATE_LOCK:

            return AI_STATE.copy()


    # --------------------------------------------------------
    # STOP
    # --------------------------------------------------------

    def stop(self):

        self.running = False

        if self.camera:

            self.camera.stop()

            self.camera = None