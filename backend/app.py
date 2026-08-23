"""
MotoSense AI
FINAL FRONT INTEGRATION

Camera
YOLO11n
Object Tracking
Light-blue Forward Corridor
Front HC-SR04
Front Red LED

Rear Arduino
Rear HC-SR04
Green / Yellow / Red LEDs
Buzzer
SOS

The front ultrasonic/YOLO system does NOT trigger SOS.
"""

import atexit
import time
import threading

import cv2
import RPi.GPIO as GPIO

from flask import (
    Flask,
    Response,
    jsonify
)

from flask_cors import CORS


from config import (
    HOST,
    PORT,

    FRONT_TRIG_PIN,
    FRONT_ECHO_PIN,

    FRONT_RED_LED_PIN,

    BASE_YELLOW_DISTANCE,
)


from camera.camera import CameraManager

from ai.detector import YOLODetector

from sensors.pi_ultrasonic import FrontUltrasonic

from sensors.arduino import ArduinoManager



# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# HARDWARE
# ============================================================

camera = CameraManager()

yolo = YOLODetector(
    camera
)

front_sensor = FrontUltrasonic(
    FRONT_TRIG_PIN,
    FRONT_ECHO_PIN
)

arduino = ArduinoManager(
    "/dev/ttyUSB0",
    115200
)


# ============================================================
# LED
# ============================================================

GPIO.setmode(
    GPIO.BCM
)

GPIO.setup(

    FRONT_RED_LED_PIN,

    GPIO.OUT,

    initial=GPIO.LOW
)


# ============================================================
# SYSTEM
# ============================================================

system_running = False

# ============================================================
# TEMPORARY ALERT HISTORY — RAM ONLY
# ============================================================
#
# This data is intentionally NOT written to disk.
# It resets whenever the backend restarts.
# ============================================================

alert_history_lock = threading.Lock()

alert_summary = {
    "front_warning": {
        "count": 0,
        "total_duration_s": 0.0,
    },

    "front_danger": {
        "count": 0,
        "total_duration_s": 0.0,
    },

    "rear_warning": {
        "count": 0,
        "total_duration_s": 0.0,
    },

    "rear_danger": {
        "count": 0,
        "total_duration_s": 0.0,
    },

    "sos": {
        "count": 0,
        "total_duration_s": 0.0,
    },
}


# Currently active alert episodes.
active_alerts = {}

# Recent alert episodes.
# Kept small so RAM usage cannot grow indefinitely.
alert_events = []

MAX_ALERT_EVENTS = 100


def _close_alert(
    key,
    now,
):
    """
    Close an active alert and calculate its duration.
    """

    active = active_alerts.pop(
        key,
        None
    )

    if active is None:
        return

    duration = max(
        0.0,
        now - active["start_time"]
    )

    alert_summary[key][
        "total_duration_s"
    ] += duration

    for event in reversed(
        alert_events
    ):

        if (
            event["key"] == key
            and event["end_time"] is None
        ):

            event["end_time"] = now

            event["duration_s"] = (
                duration
            )

            break


def _start_alert(
    key,
    title,
    source,
    level,
    now,
):
    """
    Start one new alert episode.
    """

    alert_summary[key][
        "count"
    ] += 1

    active_alerts[key] = {
        "start_time": now,
        "title": title,
        "source": source,
        "level": level,
    }

    alert_events.append({

        "key": key,

        "title": title,

        "source": source,

        "level": level,

        "start_time": now,

        "end_time": None,

        "duration_s": 0.0,

    })

    # Keep only the latest events in RAM.
    if len(alert_events) > MAX_ALERT_EVENTS:

        del alert_events[
            :-MAX_ALERT_EVENTS
        ]


def _update_proximity_alert(
    source,
    danger_level,
    now,
):
    """
    Tracks GREEN → YELLOW → RED transitions.

    A continuous warning/danger period counts
    as ONE alert, not hundreds of API polls.
    """

    level = (
        str(danger_level or "GREEN")
        .upper()
    )

    if level not in {
        "GREEN",
        "YELLOW",
        "RED",
    }:

        level = "GREEN"


    if source == "front":

        warning_key = (
            "front_warning"
        )

        danger_key = (
            "front_danger"
        )

        warning_title = (
            "Front Warning"
        )

        danger_title = (
            "Front Danger"
        )

    else:

        warning_key = (
            "rear_warning"
        )

        danger_key = (
            "rear_danger"
        )

        warning_title = (
            "Rear Warning"
        )

        danger_title = (
            "Rear Danger"
        )


    # --------------------------------------------------------
    # GREEN
    # --------------------------------------------------------

    if level == "GREEN":

        _close_alert(
            warning_key,
            now,
        )

        _close_alert(
            danger_key,
            now,
        )

        return


    # --------------------------------------------------------
    # YELLOW
    # --------------------------------------------------------

    if level == "YELLOW":

        # Close RED if it was active.
        _close_alert(
            danger_key,
            now,
        )

        # Start YELLOW only once.
        if warning_key not in active_alerts:

            _start_alert(

                warning_key,

                warning_title,

                source,

                "WARNING",

                now,
            )

        return


    # --------------------------------------------------------
    # RED
    # --------------------------------------------------------

    if level == "RED":

        # Close YELLOW if it was active.
        _close_alert(
            warning_key,
            now,
        )

        # Start RED only once.
        if danger_key not in active_alerts:

            _start_alert(

                danger_key,

                danger_title,

                source,

                "DANGER",

                now,
            )


def _update_sos_alert(
    sos_status,
    now,
):
    """
    SOS is counted once when it enters
    PENDING/ACTIVE.

    PENDING → ACTIVE remains one SOS event.
    NORMAL closes the event.
    """

    status = (
        str(sos_status or "NORMAL")
        .upper()
    )

    if status in {
        "PENDING",
        "ACTIVE",
    }:

        if "sos" not in active_alerts:

            _start_alert(

                "sos",

                "Emergency SOS",

                "sos",

                status,

                now,
            )

        else:

            # Update current SOS level
            # without creating another count.
            active_alerts["sos"][
                "level"
            ] = status

        return


    _close_alert(
        "sos",
        now,
    )


def update_alert_history(
    front_state=None,
    rear_state=None,
):
    """
    Synchronise the RAM alert history
    with the latest sensor states.
    """

    now = time.time()

    with alert_history_lock:

        if front_state is not None:

            _update_proximity_alert(

                "front",

                front_state.get(
                    "danger_level",
                    "GREEN"
                ),

                now,
            )


        if rear_state is not None:

            _update_proximity_alert(

                "rear",

                rear_state.get(
                    "danger_level",
                    "GREEN"
                ),

                now,
            )

            _update_sos_alert(

                rear_state.get(
                    "sos_status",
                    "NORMAL"
                ),

                now,
            )


def _format_alert_event(
    event,
    now,
):
    """
    Return an event with a live duration
    when the alert is still active.
    """

    result = event.copy()

    if result["end_time"] is None:

        result["duration_s"] = max(
            0.0,
            now - result["start_time"]
        )

    return result


def get_alert_history():

    now = time.time()

    with alert_history_lock:

        summary = {}

        for key, value in (
            alert_summary.items()
        ):

            total = (
                value["total_duration_s"]
            )

            active = active_alerts.get(
                key
            )

            if active is not None:

                total += max(
                    0.0,
                    now
                    - active[
                        "start_time"
                    ]
                )

            summary[key] = {

                "count":
                    value["count"],

                "total_duration_s":
                    round(
                        total,
                        1
                    ),

            }


        events = [

            _format_alert_event(
                event,
                now,
            )

            for event in alert_events
        ]


        active = []

        for key, data in (
            active_alerts.items()
        ):

            active.append({

                "key": key,

                "title":
                    data["title"],

                "source":
                    data["source"],

                "level":
                    data["level"],

                "start_time":
                    data["start_time"],

                "duration_s":
                    round(
                        max(
                            0.0,
                            now
                            - data[
                                "start_time"
                            ]
                        ),
                        1,
                    ),

            })


        return {

            "summary":
                summary,

            "events":
                events,

            "active":
                active,

            "timestamp":
                now,

        }


# ============================================================
# FRONT FUSION
# ============================================================

def get_front_safety():

    yolo_state = (
        yolo.get_state()
    )

    ultrasonic_state = (
        front_sensor.get_state()
    )


    # --------------------------------------------------------
    # ULTRASONIC DISTANCE
    # --------------------------------------------------------

    distance = (
        ultrasonic_state.get(
            "distance_m"
        )
    )


    # --------------------------------------------------------
    # YOLO DANGER
    # --------------------------------------------------------

    yolo_danger = (
        yolo_state.get(
            "danger_level",
            "GREEN"
        )
    )


    # --------------------------------------------------------
    # ULTRASONIC DANGER
    #
    # Existing config:
    # BASE_YELLOW_DISTANCE
    #
    # RED is hard-coded at 0.50 m.
    # --------------------------------------------------------

    ultrasonic_danger = "GREEN"


    if distance is not None:

        if distance <= 0.50:

            ultrasonic_danger = "RED"

        elif (
            distance
            <= BASE_YELLOW_DISTANCE
        ):

            ultrasonic_danger = "YELLOW"


    # --------------------------------------------------------
    # FUSION
    # --------------------------------------------------------

    if (
        yolo_danger == "RED"
        or
        ultrasonic_danger == "RED"
    ):

        danger = "RED"

    elif (
        yolo_danger == "YELLOW"
        or
        ultrasonic_danger == "YELLOW"
    ):

        danger = "YELLOW"

    else:

        danger = "GREEN"


    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if danger == "RED":

        status = (
            "FORWARD_COLLISION"
        )

    elif danger == "YELLOW":

        status = (
            "FORWARD_WARNING"
        )

    elif yolo_state.get(
        "object_count",
        0
    ) > 0:

        status = (
            "OBJECT_DETECTED"
        )

    else:

        status = "CLEAR"


    # --------------------------------------------------------
    # FRONT LED
    #
    # RED ONLY
    # --------------------------------------------------------

    led_on = (
        danger == "RED"
    )


    GPIO.output(

        FRONT_RED_LED_PIN,

        GPIO.HIGH
        if led_on
        else GPIO.LOW
    )


    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "status":
            status,

        "danger_level":
            danger,

        "object":
            yolo_state.get(
                "object"
            ),

        "track_id":
            yolo_state.get(
                "track_id"
            ),

        "confidence":
            yolo_state.get(
                "confidence"
            ),

        "box":
            yolo_state.get(
                "box"
            ),

        "box_area_ratio":
            yolo_state.get(
                "box_area_ratio",
                0.0
            ),

        "center_x":
            yolo_state.get(
                "center_x"
            ),

        "center_y":
            yolo_state.get(
                "center_y"
            ),

        "object_count":
            yolo_state.get(
                "object_count",
                0
            ),

        "objects":
            yolo_state.get(
                "objects",
                []
            ),

        "distance_m":
            distance,

        "yolo_danger":
            yolo_danger,

        "ultrasonic_danger":
            ultrasonic_danger,

        "led":
            led_on,

        # Front detection does NOT trigger SOS.
        "sos":
            False,

        "timestamp":
            time.time()
    }


# ============================================================
# LIVE VIDEO
# ============================================================

def generate_frames():

    while system_running:

        frame = (
            yolo.get_frame()
        )


        if frame is None:

            time.sleep(
                0.03
            )

            continue


        # ----------------------------------------------------
        # FRONT FUSION
        # ----------------------------------------------------

        safety = (
            get_front_safety()
        )


        # ----------------------------------------------------
        # ULTRASONIC TEXT
        # ----------------------------------------------------

        distance = (
            safety["distance_m"]
        )


        if distance is None:

            ultrasonic_text = (
                "ULTRASONIC: --"
            )

        else:

            ultrasonic_text = (
                f"ULTRASONIC: "
                f"{distance:.2f} m"
            )


        cv2.putText(

            frame,

            ultrasonic_text,

            (15, 130),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.70,

            (255, 255, 255),

            2,

            cv2.LINE_AA
        )


        # ----------------------------------------------------
        # FUSED DANGER
        # ----------------------------------------------------

        danger = (
            safety["danger_level"]
        )


        if danger == "RED":

            danger_color = (
                0,
                0,
                255
            )

        elif danger == "YELLOW":

            danger_color = (
                0,
                255,
                255
            )

        else:

            danger_color = (
                0,
                255,
                0
            )


        cv2.putText(

            frame,

            f"FUSED DANGER: {danger}",

            (15, 165),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.70,

            danger_color,

            2,

            cv2.LINE_AA
        )


        # ----------------------------------------------------
        # LED
        # ----------------------------------------------------

        led_text = (

            "LED: ON"

            if safety["led"]

            else

            "LED: OFF"
        )


        cv2.putText(

            frame,

            led_text,

            (15, 200),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.70,

            danger_color,

            2,

            cv2.LINE_AA
        )


        # ----------------------------------------------------
        # JPEG
        # ----------------------------------------------------

        success, buffer = (
            cv2.imencode(
                ".jpg",
                frame,
                [
                    cv2.IMWRITE_JPEG_QUALITY,
                    85
                ]
            )
        )


        if not success:

            continue


        frame_bytes = (
            buffer.tobytes()
        )


        yield (

            b"--frame\r\n"

            b"Content-Type: image/jpeg\r\n\r\n"

            + frame_bytes

            + b"\r\n"
        )


        time.sleep(
            0.03
        )


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return jsonify({

        "project":
            "MotoSense AI",

        "system":
            "FRONT INTEGRATED",

        "status":
            "RUNNING",

        "camera":
            camera.get_status(),

        "yolo":
            yolo.get_state(),

        "ultrasonic":
            front_sensor.get_state(),

        "rear":
            arduino.get_state(),

        "front":
            get_front_safety(),

        "video":
            "/video",

        "sos":
            False
    })


# ============================================================
# LIVE VIDEO
# ============================================================

@app.route("/video")
def video():

    return Response(

        generate_frames(),

        mimetype=(
            "multipart/x-mixed-replace; "
            "boundary=frame"
        )
    )


# ============================================================
# COMPLETE FRONT STATUS
# ============================================================

@app.route("/api/front")
def front_status():

    return jsonify(
        get_front_safety()
    )


# ============================================================
# REAR ARDUINO STATUS
# ============================================================

@app.route("/api/rear")
def rear_status():

    state = arduino.get_state()

    update_alert_history(
        rear_state=state
    )

    return jsonify(
        state
    )

# ============================================================
# TEMPORARY ALERT HISTORY
# ============================================================

@app.route(
    "/api/alerts/history"
)
def alerts_history():

    front = get_front_safety()

    rear = arduino.get_state()

    update_alert_history(
        front_state=front,
        rear_state=rear,
    )

    return jsonify(
        get_alert_history()
    )

# ============================================================
# REAR SOS CANCEL
# ============================================================

@app.route(
    "/api/rear/sos/cancel",
    methods=["POST"]
)
def rear_sos_cancel():

    success = arduino.cancel_sos()

    if success:

        return jsonify({
            "success": True,
            "message": "Rear SOS cancelled"
        })

    return jsonify({
        "success": False,
        "message": "Arduino is not connected"
    }), 503


# ============================================================
# YOLO STATUS
# ============================================================

@app.route("/api/ai")
def ai_status():

    return jsonify(
        yolo.get_state()
    )


# ============================================================
# CAMERA STATUS
# ============================================================

@app.route("/api/camera")
def camera_status():

    return jsonify(
        camera.get_status()
    )


# ============================================================
# ULTRASONIC STATUS
# ============================================================

@app.route("/api/ultrasonic")
def ultrasonic_status():

    return jsonify(
        front_sensor.get_state()
    )


# ============================================================
# START SYSTEM
# ============================================================

def start_system():

    global system_running


    print("")
    print("=" * 60)
    print("              MOTOSENSE AI")
    print("         FRONT + REAR INTEGRATED SYSTEM")
    print("=" * 60)


    # --------------------------------------------------------
    # CAMERA
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting camera..."
    )


    if not camera.start():

        print(
            "[ERROR] Camera failed"
        )

        return False


    print(
        "[OK] Camera started"
    )


    # --------------------------------------------------------
    # ULTRASONIC
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting front ultrasonic..."
    )


    front_sensor.start()


    print(
        "[OK] Front ultrasonic started"
    )


    # --------------------------------------------------------
    # ARDUINO
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting rear Arduino..."
    )


    arduino.start()


    print(
        "[OK] Rear Arduino started"
    )


    # --------------------------------------------------------
    # YOLO
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting YOLO11n..."
    )


    yolo.start()


    print(
        "[OK] YOLO started"
    )


    system_running = True


    print("")
    print("=" * 60)
    print("       FRONT + REAR SYSTEM READY")
    print("=" * 60)
    print(
        f"Server : http://{HOST}:{PORT}"
    )
    print(
        f"Video  : http://<RASPBERRY-IP>:{PORT}/video"
    )
    print(
        f"Front  : http://<RASPBERRY-IP>:{PORT}/api/front"
    )
    print(
        f"Rear   : http://<RASPBERRY-IP>:{PORT}/api/rear"
    )
    print("=" * 60)


    return True


# ============================================================
# SHUTDOWN
# ============================================================

def shutdown():

    global system_running


    print(
        "\n[MOTOSENSE] Shutting down..."
    )


    system_running = False


    try:

        yolo.stop()

    except Exception:
        pass


    try:

        camera.stop()

    except Exception:
        pass


    try:

        front_sensor.stop()

    except Exception:
        pass


    try:

        arduino.stop()

    except Exception:
        pass


    try:

        GPIO.output(
            FRONT_RED_LED_PIN,
            GPIO.LOW
        )

        GPIO.cleanup()

    except Exception:
        pass


    print(
        "[MOTOSENSE] Shutdown complete."
    )


atexit.register(
    shutdown
)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    if start_system():

        app.run(

            host=HOST,

            port=PORT,

            debug=False,

            threaded=True
        )