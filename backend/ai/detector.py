"""
MotoSense AI
Integrated YOLO11n Object Detection
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

        self.latest_frame = None

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

        print("[YOLO] Detection started.")

    def _loop(self):

        while self.running:

            frame = self.camera.capture()

            if frame is None:
                time.sleep(0.05)
                continue

            try:

                results = self.model(
                    frame,
                    conf=YOLO_CONFIDENCE,
                    imgsz=YOLO_IMAGE_SIZE,
                    verbose=False
                )

                best = None

                for result in results:

                    if result.boxes is None:
                        continue

                    for box in result.boxes:

                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])

                        name = self.model.names[class_id]

                        if name not in DANGEROUS_OBJECTS:
                            continue

                        x1, y1, x2, y2 = (
                            box.xyxy[0].tolist()
                        )

                        frame_height, frame_width = frame.shape[:2]

                        width = max(0, x2 - x1)
                        height = max(0, y2 - y1)

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
                            "confidence": round(confidence, 3),
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
                            or confidence >
                            best["confidence"]
                        ):
                            best = candidate

                annotated = results[0].plot()

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

                    danger_level = self._calculate_danger(best)

                    if danger_level == "RED":
                        status = "FORWARD_COLLISION"

                    elif danger_level == "YELLOW":
                        status = "FORWARD_WARNING"

                    else:
                        status = "OBJECT_DETECTED"

                    new_state = {
                        "running": True,
                        "status": status,
                        "danger_level": danger_level,
                        "object": best["object"],
                        "confidence": best["confidence"],
                        "box": best["box"],
                        "box_area_ratio": best["box_area_ratio"],
                        "center_x": best["center_x"],
                        "center_y": best["center_y"],
                        "timestamp": time.time()
                    }

                # ------------------------------------------------
                # DRAW MOTOSENSE INFORMATION ON VIDEO
                # ------------------------------------------------

                import cv2

                state_text = (
                    f"{new_state['status']} | "
                    f"DANGER: {new_state['danger_level']}"
                )

                cv2.putText(
                    annotated,
                    state_text,
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.9,
                    (0, 0, 255)
                    if new_state["danger_level"] == "RED"
                    else (0, 255, 255)
                    if new_state["danger_level"] == "YELLOW"
                    else (0, 255, 0),
                    2
                )

                if new_state["object"]:

                    object_text = (
                        f"OBJECT: {new_state['object']}  "
                        f"CONF: {new_state['confidence']}"
                    )

                    cv2.putText(
                        annotated,
                        object_text,
                        (20, 80),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (255, 255, 255),
                        2
                    )

                with self.lock:

                    self.state = new_state
                    self.latest_frame = annotated.copy()

            except Exception as error:

                print(f"[YOLO] Error: {error}")

                with self.lock:

                    self.state.update({
                        "running": False,
                        "status": "ERROR",
                        "danger_level": "GREEN",
                        "timestamp": time.time()
                    })

                time.sleep(1)

    def _calculate_danger(self, detection):

        area = detection["box_area_ratio"]

        center_x = detection["center_x"]
        center_y = detection["center_y"]

        central = (
            0.20 <= center_x <= 0.80
            and
            center_y >= 0.20
        )

        if not central:
            return "GREEN"

        if area >= 0.25:
            return "RED"

        if area >= 0.08:
            return "YELLOW"

        return "GREEN"

    def get_state(self):

        with self.lock:
            return self.state.copy()

    def get_frame(self):

        with self.lock:

            if self.latest_frame is None:
                return None

            return self.latest_frame.copy()

    def stop(self):

        self.running = False

        if self.thread:

            self.thread.join(timeout=2)

        print("[YOLO] Detection stopped.")