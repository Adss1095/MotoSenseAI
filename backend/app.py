"""
MotoSense AI
Main Backend Application

Phase 1:
Clean backend foundation only.

No camera.
No YOLO.
No ultrasonic.
No Arduino.
No weather.
No SOS.
"""
from front.yolo import YOLODetector
from flask import Flask, jsonify

from config import (
    PROJECT_NAME,
    VERSION,
    PLATFORM,
    HOST,
    PORT,
)


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)
yolo_detector = YOLODetector()

# ============================================================
# ROOT
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "project": PROJECT_NAME,
        "version": VERSION,
        "platform": PLATFORM,
        "status": "Backend Running",
    })


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.route("/api/system/status", methods=["GET"])
def system_status():

    return jsonify({
        "project": PROJECT_NAME,
        "version": VERSION,
        "platform": PLATFORM,
        "backend": True,
        "status": "RUNNING",
    })

@app.route("/api/ai", methods=["GET"])
def ai_status():

    return jsonify(
        yolo_detector.get_state()
    )


# ============================================================
# START SERVER
# ============================================================
if __name__ == "__main__":

    print("==========================================")
    print("        MOTOSENSE AI BACKEND")
    print("==========================================")
    print(f"Project  : {PROJECT_NAME}")
    print(f"Version  : {VERSION}")
    print(f"Platform : {PLATFORM}")
    print(f"Server   : http://{HOST}:{PORT}")
    print("==========================================")

    yolo_detector.start()

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
    )