"""
MotoSense AI
Main Backend

Features
--------
1. Raspberry Pi Camera
2. YOLO object detection
3. Front HC-SR04
4. Arduino rear HC-SR04
5. Adaptive rider behaviour
6. Green / Yellow / Red danger classification
7. Front collision LED
8. Rear LED/buzzer system
9. 10-second crash detection
10. SOS state
"""

import atexit
import threading
import time

from flask import Flask, jsonify
from flask_cors import CORS

import RPi.GPIO as GPIO

from config import (
    PROJECT_NAME,
    VERSION,
    PLATFORM,
    HOST,
    PORT,

    FRONT_TRIG_PIN,
    FRONT_ECHO_PIN,
    FRONT_RED_LED_PIN,

    ARDUINO_PORT,
    ARDUINO_BAUDRATE,

    SOS_CRITICAL_SECONDS,
)

from camera.camera import CameraManager

from ai.detector import YOLODetector
from ai.danger import DangerManager

from sensors.pi_ultrasonic import FrontUltrasonic
from sensors.arduino import ArduinoManager

from safety.sos import SOSManager

from rider_model import RiderBehaviourModel
from adaptive import AdaptiveSafety


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# HARDWARE / AI OBJECTS
# ============================================================

camera = CameraManager()

front_sensor = FrontUltrasonic(
    FRONT_TRIG_PIN,
    FRONT_ECHO_PIN
)

yolo = YOLODetector(
    camera
)

arduino = ArduinoManager(
    ARDUINO_PORT,
    ARDUINO_BAUDRATE
)

danger = DangerManager()

sos = SOSManager(
    SOS_CRITICAL_SECONDS
)

rider = RiderBehaviourModel()

adaptive = AdaptiveSafety()


# ============================================================
# FRONT RED LED
# ============================================================

GPIO.setmode(GPIO.BCM)

GPIO.setup(
    FRONT_RED_LED_PIN,
    GPIO.OUT,
    initial=GPIO.LOW
)


# ============================================================
# CONTROLLER LOOP
# ============================================================

controller_running = False

controller_thread = None


def controller_loop():

    global controller_running

    while controller_running:

        try:

            # ------------------------------------------------
            # YOLO
            # ------------------------------------------------

            yolo_state = (
                yolo.get_state()
            )


            # ------------------------------------------------
            # FRONT SENSOR
            # ------------------------------------------------

            front_state = (
                front_sensor.get_state()
            )


            # ------------------------------------------------
            # RIDER MODEL
            # ------------------------------------------------

            rider_state = (
                rider.get_state()
            )


            # ------------------------------------------------
            # ADAPTIVE RADIUS
            # ------------------------------------------------

            adaptive_state = (
                adaptive.calculate(
                    rider_state
                )
            )


            # ------------------------------------------------
            # REAR ARDUINO
            # ------------------------------------------------

            rear_state = (
                arduino.get_state()
            )


            # ------------------------------------------------
            # UPDATE FRONT DANGER
            # ------------------------------------------------

            danger.update_front(
                yolo_state
            )


            # ------------------------------------------------
            # UPDATE REAR DANGER
            # ------------------------------------------------

            danger.update_rear(
                rear_state
            )


            danger_state = (
                danger.get_state()
            )


            # ------------------------------------------------
            # FRONT LED
            #
            # IMPORTANT:
            # This LED lights ONLY when YOLO is RED.
            # ------------------------------------------------

            if (
                yolo_state.get(
                    "danger_level"
                ) == "RED"
            ):

                GPIO.output(
                    FRONT_RED_LED_PIN,
                    GPIO.HIGH
                )

            else:

                GPIO.output(
                    FRONT_RED_LED_PIN,
                    GPIO.LOW
                )


            # ------------------------------------------------
            # SOS
            # ------------------------------------------------

            sos.update(
                danger_state[
                    "overall"
                ]
            )


            # ------------------------------------------------
            # SEND ADAPTIVE THRESHOLDS
            # TO ARDUINO
            # ------------------------------------------------

            arduino.send_thresholds(
                adaptive_state[
                    "green_m"
                ],
                adaptive_state[
                    "yellow_m"
                ],
                adaptive_state[
                    "red_m"
                ]
            )


        except Exception as error:

            print(
                f"[CONTROLLER] {error}"
            )


        time.sleep(0.25)


# ============================================================
# START
# ============================================================

def start_system():

    global controller_running
    global controller_thread


    print("")
    print("=" * 50)
    print("          MOTOSENSE AI BACKEND")
    print("=" * 50)
    print(f"Project  : {PROJECT_NAME}")
    print(f"Version  : {VERSION}")
    print(f"Platform : {PLATFORM}")
    print(f"Server   : http://{HOST}:{PORT}")
    print("=" * 50)


    # --------------------------------------------------------
    # CAMERA
    # --------------------------------------------------------

    if camera.start():

        print(
            "[OK] Camera started"
        )

    else:

        print(
            "[ERROR] Camera failed"
        )


    # --------------------------------------------------------
    # FRONT ULTRASONIC
    # --------------------------------------------------------

    front_sensor.start()

    print(
        "[OK] Front ultrasonic started"
    )


    # --------------------------------------------------------
    # YOLO
    # --------------------------------------------------------

    yolo.start()

    print(
        "[OK] YOLO started"
    )


    # --------------------------------------------------------
    # ARDUINO
    # --------------------------------------------------------

    arduino.start()


    # --------------------------------------------------------
    # RIDER MODEL
    # --------------------------------------------------------

    rider.start()

    print(
        "[OK] Mock rider model started"
    )


    # --------------------------------------------------------
    # CONTROLLER
    # --------------------------------------------------------

    controller_running = True

    controller_thread = threading.Thread(
        target=controller_loop,
        daemon=True
    )

    controller_thread.start()

    print(
        "[OK] Safety controller started"
    )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return jsonify({

        "project":
            PROJECT_NAME,

        "version":
            VERSION,

        "platform":
            PLATFORM,

        "backend":
            True,

        "status":
            "RUNNING"
    })


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/system/status")
def system_status():

    return jsonify({

        "project":
            PROJECT_NAME,

        "version":
            VERSION,

        "platform":
            PLATFORM,

        "backend":
            True,

        "status":
            "RUNNING"
    })


# ============================================================
# COMPLETE STATUS
# ============================================================

@app.get("/api/status")
def complete_status():

    return jsonify({

        "backend": True,

        "camera":
            camera.get_status(),

        "yolo":
            yolo.get_state(),

        "front_sensor":
            front_sensor.get_state(),

        "rear_sensor":
            arduino.get_state(),

        "danger":
            danger.get_state(),

        "rider":
            rider.get_state(),

        "adaptive":
            adaptive.state,

        "sos":
            sos.get_state(),

        "timestamp":
            time.time()
    })


# ============================================================
# YOLO
# ============================================================

@app.get("/api/ai")
def ai_status():

    return jsonify(
        yolo.get_state()
    )


# ============================================================
# CAMERA
# ============================================================

@app.get("/api/camera")
def camera_status():

    return jsonify(
        camera.get_status()
    )


# ============================================================
# FRONT SENSOR
# ============================================================

@app.get("/api/front")
def front_status():

    return jsonify({

        "sensor":
            front_sensor.get_state(),

        "yolo":
            yolo.get_state()
    })


# ============================================================
# REAR SENSOR
# ============================================================

@app.get("/api/rear")
def rear_status():

    return jsonify(
        arduino.get_state()
    )


# ============================================================
# DANGER
# ============================================================

@app.get("/api/danger")
def danger_status():

    return jsonify(
        danger.get_state()
    )


# ============================================================
# RIDER
# ============================================================

@app.get("/api/rider")
def rider_status():

    return jsonify(
        rider.get_state()
    )


# ============================================================
# ADAPTIVE RADIUS
# ============================================================

@app.get("/api/adaptive")
def adaptive_status():

    rider_state = (
        rider.get_state()
    )

    values = adaptive.calculate(
        rider_state
    )

    return jsonify({

        "rider":
            rider_state,

        "safety_radius":
            values
    })


# ============================================================
# SOS
# ============================================================

@app.get("/api/sos")
def sos_status():

    return jsonify(
        sos.get_state()
    )


# ============================================================
# RESET SOS
# ============================================================

@app.post("/api/sos/reset")
def reset_sos():

    sos.reset()

    return jsonify({

        "success":
            True,

        "sos":
            sos.get_state()
    })


# ============================================================
# CLEANUP
# ============================================================

def cleanup():

    global controller_running

    print(
        "\n[MOTOSENSE] Shutting down..."
    )

    controller_running = False

    try:
        yolo.stop()
    except Exception:
        pass

    try:
        front_sensor.stop()
    except Exception:
        pass

    try:
        camera.stop()
    except Exception:
        pass

    try:
        arduino.stop()
    except Exception:
        pass

    try:
        rider.stop()
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
    cleanup
)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    start_system()

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
        threaded=True
    )