from flask import Flask, jsonify
from flask_cors import CORS

from ai.detector import YOLODetector


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# YOLO DETECTOR
# ============================================================

yolo_detector = YOLODetector()


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return jsonify({
        "project": "MotoSense AI",
        "backend": True,
        "platform": "Raspberry Pi 4B",
        "status": "RUNNING",
        "version": "1.0.0"
    })


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/status")
def status():

    ai_state = yolo_detector.get_state()

    return jsonify({
        "backend": True,
        "camera": "READY",
        "ai": ai_state["status"],
        "platform": "Raspberry Pi 4B"
    })


# ============================================================
# AI STATUS
# ============================================================

@app.get("/api/ai")
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
    print("Project  : MotoSense AI")
    print("Version  : 1.0.0")
    print("Platform : Raspberry Pi 4B")
    print("Server   : http://0.0.0.0:5000")
    print("==========================================")

    # Start camera + YOLO
    yolo_detector.start()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )