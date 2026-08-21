"""
MotoSense AI
YOLO Object Detection

Raspberry Pi 4B + Camera Module 3
"""

import threading
import time

from ultralytics import YOLO

from config import (
    YOLO_MODEL,
    YOLO_CONFIDENCE,
    YOLO_IMAGE_SIZE,
)


DANGEROUS_OBJECTS = {
    "person",
    "bicycle",
    "motorcycle",
    "car",
    "bus",
    "truck",
    "train",
}


class YOLODetector:

    def __init__(self, camera):

        self.camera = camera

        self.model = None

        self.running = False

        self.thread = None

        self.lock = threading.Lock()

        self.state = {
            "running": False,
            "status": "STARTING",
            "danger_level": "GREEN",

            "object": None,
            "confidence": None,

            "box": None,
            "box_area_ratio": 0.0,

            "center_x": None,
            "center_y": None,

            "timestamp": None,
        }


    # ========================================================
    # START
    # ========================================================

    def start(self):

        if self.running:
            return

        print("[YOLO] Loading model...")

        self.model = YOLO(YOLO_MODEL)

        print("[YOLO] Model loaded.")

        self.running = True

        self.thread = threading.Thread(
            target=self._loop,
            daemon=True
        )

        self.thread.start()
    # ========================================================
    # DETECTION LOOP
    # ========================================================

    def _loop(self):

        while self.running:

            frame = self.camera.capture()

            if frame is None:

                time.sleep(0.2)

                continue


            try:

                results = self.model(
                    frame,
                    conf=YOLO_CONFIDENCE,
                    imgsz=YOLO_IMAGE_SIZE,
                    verbose=False
                )

                best = None


                # ------------------------------------------------
                # FIND MOST IMPORTANT DETECTION
                # ------------------------------------------------

                for result in results:

                    if result.boxes is None:
                        continue

                    for box in result.boxes:

                        confidence = float(
                            box.conf[0]
                        )
                        class_id = int(
                            box.cls[0]
                        )

                        name = self.model.names[
                            class_id
                        ]

                        if name not in DANGEROUS_OBJECTS:
                            continue

                        coordinates = (
                            box.xyxy[0]
                            .tolist()
                        )

                        x1, y1, x2, y2 = coordinates

                        width = max(
                            0,
                            x2 - x1
                        )

                        height = max(
                            0,
                            y2 - y1
                        )

                        frame_height, frame_width = (
                            frame.shape[:2]
                        )

                        area_ratio = (
                            width * height
                        ) / (
                            frame_width * frame_height
                        )

                        center_x = (
                            (x1 + x2) / 2
                        ) / frame_width

                        center_y = (
                            (y1 + y2) / 2
                        ) / frame_height


                        candidate = {
                            "object": name,
                            "confidence": round(
                                confidence,
                                3
                            ),
                            "box": [
                                round(x1),
                                round(y1),
                                round(x2),
                                round(y2)
                            ],
                            "box_area_ratio": round(
                                area_ratio,
                                4
                            ),
                            "center_x": round(
                                center_x,
                                3
                            ),
                            "center_y": round(
                                center_y,
                                3
                            )
                        }


                        if (
                            best is None
                            or
                            confidence >
                            best["confidence"]
                        ):

                            best = candidate


                # ------------------------------------------------
                # DETERMINE DANGER
                # ------------------------------------------------

                if best is None:

                    new_state = {
                        "running": True,
                        "status": "CLEAR",
                        "danger_level": "GREEN",

                        "object": None,
                        "confidence": None,

                        "box": None,
                        "box_area_ratio": 0.0,

                        "center_x": None,
                        "center_y": None,

                        "timestamp": time.time()
                    }

                else:

                    danger_level = (
                        self._calculate_danger(
                            best
                        )
                    )

                    status = (
                        "OBJECT_DETECTED"
                    )

                    if danger_level == "RED":
                        status = "FORWARD_COLLISION"

                    elif danger_level == "YELLOW":
                        status = "FORWARD_WARNING"


                    new_state = {
                        "running": True,
                        "status": status,
                        "danger_level": danger_level,

                        "object": best["object"],
                        "confidence": best["confidence"],

                        "box": best["box"],
                        "box_area_ratio": best[
                            "box_area_ratio"
                        ],

                        "center_x": best["center_x"],
                        "center_y": best["center_y"],

                        "timestamp": time.time()
                    }


                with self.lock:
                    self.state = new_state


            except Exception as error:

                print(
                    f"[YOLO] Error: {error}"
                )

                with self.lock:

                    self.state.update({
                        "running": False,
                        "status": "ERROR",
                        "danger_level": "GREEN",
                        "timestamp": time.time()
                    })

                time.sleep(1)


    # ========================================================
    # DANGER CALCULATION
    # ========================================================

    def _calculate_danger(self, detection):

        area = detection[
            "box_area_ratio"
        ]

        center_x = detection[
            "center_x"
        ]

        center_y = detection[
            "center_y"
        ]


        # Object must generally be in front
        central = (
            0.20 <= center_x <= 0.80
            and
            center_y >= 0.20
        )


        if not central:
            return "GREEN"


        # Large object = very close
        if area >= 0.25:
            return "RED"


        # Medium object
        if area >= 0.08:
            return "YELLOW"


        return "GREEN"


    # ========================================================
    # STATE
    # ========================================================

    def get_state(self):

        with self.lock:
            return self.state.copy()

    # ========================================================
    # STOP
    # ========================================================

    def stop(self):

        self.running = False

        if self.thread:

            self.thread.join(
                timeout=2
   )