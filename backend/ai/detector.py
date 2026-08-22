"""
MotoSense AI
YOLO11n Front Object Detection

Features
--------
- YOLO11n
- Persistent object tracking
- Individual object IDs
- All detected objects displayed
- Light-blue rider corridor
- Forward-path analysis
- Annotated live frame
"""

import threading
import time

import cv2
from ultralytics import YOLO

from config import (
    YOLO_MODEL,
    YOLO_CONFIDENCE,
    YOLO_IMAGE_SIZE,
)


# ============================================================
# RIDER CORRIDOR
# ============================================================

PATH_LEFT = 0.20
PATH_RIGHT = 0.80

# Light blue
LIGHT_BLUE = (
    180,
    220,
    255
)


# ============================================================
# OBJECTS THAT MATTER FOR COLLISION
# ============================================================

DANGEROUS_OBJECTS = {

    "person",
    "bicycle",
    "motorcycle",
    "car",
    "bus",
    "truck",
    "train",

    "dog",
    "cat",

    "traffic light",
    "stop sign"
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

            "track_id": None,

            "confidence": None,

            "box": None,

            "box_area_ratio": 0.0,

            "center_x": None,

            "center_y": None,

            "object_count": 0,

            "objects": [],

            "timestamp": None
        }


    # ============================================================
    # START
    # ============================================================

    def start(self):

        if self.running:
            return

        print(
            "[YOLO] Loading model..."
        )

        self.model = YOLO(
            YOLO_MODEL
        )

        print(
            "[YOLO] Model loaded."
        )

        self.running = True

        self.thread = threading.Thread(
            target=self._loop,
            daemon=True
        )

        self.thread.start()


    # ============================================================
    # DRAW CORRIDOR
    # ============================================================

    def _draw_corridor(self, frame):

        height, width = frame.shape[:2]

        left_x = int(
            width * PATH_LEFT
        )

        right_x = int(
            width * PATH_RIGHT
        )

        cv2.line(
            frame,
            (left_x, 0),
            (left_x, height),
            LIGHT_BLUE,
            3
        )

        cv2.line(
            frame,
            (right_x, 0),
            (right_x, height),
            LIGHT_BLUE,
            3
        )

        # Small labels

        cv2.putText(
            frame,
            "FORWARD PATH",
            (
                left_x + 10,
                30
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            LIGHT_BLUE,
            2,
            cv2.LINE_AA
        )


    # ============================================================
    # DRAW OBJECT
    # ============================================================

    def _draw_object(
        self,
        frame,
        x1,
        y1,
        x2,
        y2,
        name,
        confidence,
        track_id,
        in_path,
        danger
    ):

        # --------------------------------------------------------
        # BOX COLOR
        # --------------------------------------------------------

        if danger == "RED":

            box_color = (
                0,
                0,
                255
            )

        elif danger == "YELLOW":

            box_color = (
                0,
                255,
                255
            )

        elif in_path:

            box_color = (
                255,
                180,
                0
            )

        else:

            box_color = (
                0,
                255,
                0
            )


        # --------------------------------------------------------
        # BOX
        # --------------------------------------------------------

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            box_color,
            2
        )


        # --------------------------------------------------------
        # LABEL
        # --------------------------------------------------------

        if track_id is not None:

            label = (
                f"{name} "
                f"ID:{track_id} "
                f"{confidence:.2f}"
            )

        else:

            label = (
                f"{name} "
                f"{confidence:.2f}"
            )


        (text_width, text_height), _ = (
            cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                2
            )
        )


        label_y = max(
            y1,
            text_height + 5
        )


        cv2.rectangle(
            frame,
            (
                x1,
                label_y - text_height - 8
            ),
            (
                x1 + text_width + 8,
                label_y
            ),
            box_color,
            -1
        )


        cv2.putText(
            frame,
            label,
            (
                x1 + 4,
                label_y - 4
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )


    # ============================================================
    # DETECTION LOOP
    # ============================================================

    def _loop(self):

        while self.running:

            frame = self.camera.capture()

            if frame is None:

                time.sleep(0.05)

                continue


            try:

                height, width = (
                    frame.shape[:2]
                )


                # ------------------------------------------------
                # YOLO TRACKING
                # ------------------------------------------------

                results = self.model.track(

                    frame,

                    conf=YOLO_CONFIDENCE,

                    imgsz=YOLO_IMAGE_SIZE,

                    persist=True,

                    tracker="botsort.yaml",

                    verbose=False
                )


                # ------------------------------------------------
                # DRAW CORRIDOR
                # ------------------------------------------------

                annotated = frame.copy()

                self._draw_corridor(
                    annotated
                )


                detections = []

                dangerous_candidates = []


                # ------------------------------------------------
                # PROCESS EVERY OBJECT
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


                        coordinates = (
                            box.xyxy[0]
                            .tolist()
                        )

                        x1, y1, x2, y2 = (
                            coordinates
                        )


                        x1 = max(
                            0,
                            min(
                                width - 1,
                                int(x1)
                            )
                        )

                        y1 = max(
                            0,
                            min(
                                height - 1,
                                int(y1)
                            )
                        )

                        x2 = max(
                            0,
                            min(
                                width - 1,
                                int(x2)
                            )
                        )

                        y2 = max(
                            0,
                            min(
                                height - 1,
                                int(y2)
                            )
                        )


                        box_width = max(
                            0,
                            x2 - x1
                        )

                        box_height = max(
                            0,
                            y2 - y1
                        )


                        area_ratio = (
                            box_width
                            * box_height
                        ) / (
                            width
                            * height
                        )


                        center_x_pixels = (
                            x1 + x2
                        ) / 2


                        center_y_pixels = (
                            y1 + y2
                        ) / 2


                        center_x = (
                            center_x_pixels
                            / width
                        )


                        center_y = (
                            center_y_pixels
                            / height
                        )


                        # ------------------------------------------------
                        # TRACK ID
                        # ------------------------------------------------

                        track_id = None

                        if box.id is not None:

                            track_id = int(
                                box.id[0]
                            )


                        # ------------------------------------------------
                        # IS OBJECT IN RIDER PATH?
                        # ------------------------------------------------

                        in_path = (

                            PATH_LEFT
                            <= center_x
                            <= PATH_RIGHT

                            and

                            center_y >= 0.20
                        )


                        # ------------------------------------------------
                        # VISUAL DANGER
                        # ------------------------------------------------

                        object_danger = "GREEN"


                        if (
                            name
                            in DANGEROUS_OBJECTS
                            and
                            in_path
                        ):

                            if area_ratio >= 0.25:

                                object_danger = "RED"

                            elif area_ratio >= 0.08:

                                object_danger = "YELLOW"


                        # ------------------------------------------------
                        # SAVE DETECTION
                        # ------------------------------------------------

                        detection = {

                            "object":
                                name,

                            "track_id":
                                track_id,

                            "confidence":
                                round(
                                    confidence,
                                    3
                                ),

                            "box": [
                                x1,
                                y1,
                                x2,
                                y2
                            ],

                            "box_area_ratio":
                                round(
                                    area_ratio,
                                    4
                                ),

                            "center_x":
                                round(
                                    center_x,
                                    3
                                ),

                            "center_y":
                                round(
                                    center_y,
                                    3
                                ),

                            "in_path":
                                in_path,

                            "danger_level":
                                object_danger
                        }


                        detections.append(
                            detection
                        )


                        if (
                            name
                            in DANGEROUS_OBJECTS
                        ):

                            dangerous_candidates.append(
                                detection
                            )


                        # ------------------------------------------------
                        # DRAW EVERY OBJECT
                        # ------------------------------------------------

                        self._draw_object(

                            annotated,

                            x1,
                            y1,
                            x2,
                            y2,

                            name,

                            confidence,

                            track_id,

                            in_path,

                            object_danger
                        )


                # ========================================================
                # BEST DANGEROUS OBJECT
                # ========================================================

                best = None


                if dangerous_candidates:

                    best = max(

                        dangerous_candidates,

                        key=lambda item:
                        item["confidence"]
                    )


                # ========================================================
                # OVERALL VISUAL DANGER
                # ========================================================

                visual_danger = "GREEN"


                for detection in (
                    dangerous_candidates
                ):

                    level = detection[
                        "danger_level"
                    ]

                    if level == "RED":

                        visual_danger = "RED"

                        break

                    elif (
                        level == "YELLOW"
                        and
                        visual_danger != "RED"
                    ):

                        visual_danger = "YELLOW"


                # ========================================================
                # STATUS
                # ========================================================

                if visual_danger == "RED":

                    status = (
                        "FORWARD_COLLISION"
                    )

                elif visual_danger == "YELLOW":

                    status = (
                        "FORWARD_WARNING"
                    )

                elif detections:

                    status = (
                        "OBJECT_DETECTED"
                    )

                else:

                    status = "CLEAR"


                # ========================================================
                # TOP INFORMATION
                # ========================================================

                cv2.putText(

                    annotated,

                    f"YOLO OBJECTS: "
                    f"{len(detections)}",

                    (15, 65),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.70,

                    (255, 255, 255),

                    2,

                    cv2.LINE_AA
                )


                cv2.putText(

                    annotated,

                    f"VISUAL DANGER: "
                    f"{visual_danger}",

                    (15, 95),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.70,

                    (
                        0,
                        0,
                        255
                    )
                    if visual_danger == "RED"
                    else
                    (
                        0,
                        255,
                        255
                    )
                    if visual_danger == "YELLOW"
                    else
                    (
                        0,
                        255,
                        0
                    ),

                    2,

                    cv2.LINE_AA
                )


                # ========================================================
                # STATE
                # ========================================================

                if best is None:

                    new_state = {

                        "running":
                            True,

                        "status":
                            status,

                        "danger_level":
                            visual_danger,

                        "object":
                            None,

                        "track_id":
                            None,

                        "confidence":
                            None,

                        "box":
                            None,

                        "box_area_ratio":
                            0.0,

                        "center_x":
                            None,

                        "center_y":
                            None,

                        "object_count":
                            len(detections),

                        "objects":
                            detections,

                        "timestamp":
                            time.time()
                    }

                else:

                    new_state = {

                        "running":
                            True,

                        "status":
                            status,

                        "danger_level":
                            visual_danger,

                        "object":
                            best["object"],

                        "track_id":
                            best["track_id"],

                        "confidence":
                            best["confidence"],

                        "box":
                            best["box"],

                        "box_area_ratio":
                            best[
                                "box_area_ratio"
                            ],

                        "center_x":
                            best["center_x"],

                        "center_y":
                            best["center_y"],

                        "object_count":
                            len(detections),

                        "objects":
                            detections,

                        "timestamp":
                            time.time()
                    }


                # ========================================================
                # SAVE
                # ========================================================

                with self.lock:

                    self.latest_frame = annotated

                    self.state = new_state


            except Exception as error:

                print(
                    f"[YOLO] Error: {error}"
                )

                with self.lock:

                    self.state.update({

                        "running":
                            False,

                        "status":
                            "ERROR",

                        "danger_level":
                            "GREEN",

                        "timestamp":
                            time.time()
                    })


                time.sleep(0.5)


    # ============================================================
    # GET ANNOTATED FRAME
    # ============================================================

    def get_frame(self):

        with self.lock:

            if self.latest_frame is None:

                return None

            return self.latest_frame.copy()


    # ============================================================
    # STATE
    # ============================================================

    def get_state(self):

        with self.lock:

            return self.state.copy()


    # ============================================================
    # STOP
    # ============================================================

    def stop(self):

        self.running = False

        if self.thread:

            self.thread.join(
                timeout=2
            )

        self.thread = None
