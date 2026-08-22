"""
MotoSense AI
FINAL FRONT INTEGRATION + WEATHER

Camera
YOLO11n
Object Tracking
Light-blue Forward Corridor
Front HC-SR04
Front Red LED
Weather Detection
Raspberry Pi Device Temperature
Live Video

IMPORTANT
--------
Weather does NOT:
- control SOS
- control collision LED
- modify YOLO
- modify ultrasonic danger logic

The front ultrasonic/YOLO system does NOT trigger SOS.
"""

import atexit
import time

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

from weather import WeatherDetector


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

weather = WeatherDetector(
    camera
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
    # Uses existing BASE_YELLOW_DISTANCE.
    #
    # RED = 0.50 m
    # YELLOW = configured base yellow distance
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
    # FRONT RED LED
    #
    # ONLY FRONT COLLISION FUSION
    #
    # Weather NEVER controls this LED.
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
    # WEATHER
    #
    # Read only.
    #
    # Weather does not modify the front safety decision.
    # --------------------------------------------------------

    weather_state = (
        weather.get_state()
    )


    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "status":
            status,

        "danger_level":
            danger,


        # ----------------------------------------------------
        # YOLO
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # ULTRASONIC
        # ----------------------------------------------------

        "distance_m":
            distance,

        "yolo_danger":
            yolo_danger,

        "ultrasonic_danger":
            ultrasonic_danger,


        # ----------------------------------------------------
        # LED
        # ----------------------------------------------------

        "led":
            led_on,


        # ----------------------------------------------------
        # SOS
        #
        # Explicitly FALSE.
        # ----------------------------------------------------

        "sos":
            False,


        # ----------------------------------------------------
        # WEATHER
        # ----------------------------------------------------

        "weather":
            weather_state,


        "timestamp":
            time.time()
    }


# ============================================================
# LIVE VIDEO
# ============================================================

def generate_frames():

    while system_running:

        try:

            # ------------------------------------------------
            # IMPORTANT:
            #
            # YOLO's processed frame is used here.
            #
            # This preserves:
            # - object boxes
            # - object tracking
            # - light-blue forward corridor
            # - YOLO annotations
            # ------------------------------------------------

            frame = (
                yolo.get_frame()
            )


            if frame is None:

                time.sleep(
                    0.03
                )

                continue


            frame = frame.copy()


            # ------------------------------------------------
            # FRONT FUSION
            # ------------------------------------------------

            safety = (
                get_front_safety()
            )


            # ------------------------------------------------
            # ULTRASONIC TEXT
            # ------------------------------------------------

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


            # ------------------------------------------------
            # FUSED DANGER
            # ------------------------------------------------

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


            # ------------------------------------------------
            # LED
            # ------------------------------------------------

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


            # ------------------------------------------------
            # WEATHER INFORMATION
            #
            # Displayed only.
            # Does not affect collision logic.
            # ------------------------------------------------

            weather_state = (
                safety["weather"]
            )


            condition = (
                weather_state.get(
                    "condition",
                    "STARTING"
                )
            )


            temperature = (
                weather_state.get(
                    "device_temperature_c"
                )
            )


            risk = (
                weather_state.get(
                    "risk",
                    "SAFE"
                )
            )


            # ------------------------------------------------
            # WEATHER TEXT
            # ------------------------------------------------

            cv2.putText(

                frame,

                f"WEATHER: {condition}",

                (15, 235),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.65,

                (220, 220, 220),

                2,

                cv2.LINE_AA
            )


            # ------------------------------------------------
            # DEVICE TEMPERATURE
            # ------------------------------------------------

            if temperature is None:

                temp_text = (
                    "PI TEMP: --"
                )

            else:

                temp_text = (
                    f"PI TEMP: "
                    f"{temperature:.1f} C"
                )


            cv2.putText(

                frame,

                temp_text,

                (15, 270),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.65,

                (220, 220, 220),

                2,

                cv2.LINE_AA
            )


            # ------------------------------------------------
            # WEATHER RISK
            # ------------------------------------------------

            if risk == "DANGEROUS":

                weather_color = (
                    0,
                    0,
                    255
                )

            elif risk == "CAUTION":

                weather_color = (
                    0,
                    255,
                    255
                )

            else:

                weather_color = (
                    0,
                    255,
                    0
                )


            cv2.putText(

                frame,

                f"WEATHER RISK: {risk}",

                (15, 305),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.65,

                weather_color,

                2,

                cv2.LINE_AA
            )


            # ------------------------------------------------
            # JPEG
            # ------------------------------------------------

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


        except Exception as error:

            print(
                f"[VIDEO] Error: {error}"
            )

            time.sleep(
                0.1
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

        "weather":
            weather.get_state(),

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
# COMPLETE SYSTEM STATUS
# ============================================================

@app.route("/api/status")
def complete_status():

    return jsonify({

        "project":
            "MotoSense AI",

        "status":
            "RUNNING",

        "system":
            "FRONT INTEGRATED",

        "camera":
            camera.get_status(),

        "yolo":
            yolo.get_state(),

        "ultrasonic":
            front_sensor.get_state(),

        "weather":
            weather.get_state(),

        "front":
            get_front_safety(),

        "video":
            "/video",

        "sos":
            False,

        "timestamp":
            time.time()
    })


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
# WEATHER STATUS
# ============================================================

@app.route("/api/weather")
def weather_status():

    return jsonify(
        weather.get_state()
    )


# ============================================================
# START SYSTEM
# ============================================================

def start_system():

    global system_running


    print("")
    print("=" * 60)
    print("              MOTOSENSE AI")
    print("      FRONT + WEATHER INTEGRATED")
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
    # YOLO
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting YOLO11n..."
    )


    yolo.start()


    print(
        "[OK] YOLO started"
    )


    # --------------------------------------------------------
    # WEATHER
    # --------------------------------------------------------

    print(
        "[SYSTEM] Starting weather detector..."
    )


    weather.start()


    print(
        "[OK] Weather detector started"
    )


    # --------------------------------------------------------
    # SYSTEM
    # --------------------------------------------------------

    system_running = True


    print("")
    print("=" * 60)
    print("          FRONT SYSTEM READY")
    print("=" * 60)

    print(
        f"Server : http://{HOST}:{PORT}"
    )

    print(
        f"Video  : "
        f"http://<RASPBERRY-IP>:{PORT}/video"
    )

    print(
        f"Front  : "
        f"http://<RASPBERRY-IP>:{PORT}/api/front"
    )

    print(
        f"Weather: "
        f"http://<RASPBERRY-IP>:{PORT}/api/weather"
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


    # --------------------------------------------------------
    # WEATHER
    # --------------------------------------------------------

    try:

        weather.stop()

    except Exception:
        pass


    # --------------------------------------------------------
    # YOLO
    # --------------------------------------------------------

    try:

        yolo.stop()

    except Exception:
        pass


    # --------------------------------------------------------
    # CAMERA
    # --------------------------------------------------------

    try:

        camera.stop()

    except Exception:
        pass


    # --------------------------------------------------------
    # ULTRASONIC
    # --------------------------------------------------------

    try:

        front_sensor.stop()

    except Exception:
        pass


    # --------------------------------------------------------
    # LED
    # --------------------------------------------------------

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


# ============================================================
# EXIT HANDLER
# ============================================================

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