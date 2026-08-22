"""
MotoSense AI
Integrated Front Camera + YOLO Server
"""

import time
import cv2

from flask import (
    Flask,
    Response,
    jsonify,
    render_template_string
)

from camera.camera import Camera
from ai.detector import YOLODetector


app = Flask(__name__)

camera = Camera()
detector = YOLODetector(camera)


# ============================================================
# START SYSTEM
# ============================================================

print("[SYSTEM] Starting camera...")

camera.start()

print("[SYSTEM] Starting YOLO...")

detector.start()

print("[SYSTEM] MotoSense front system ready.")


# ============================================================
# LIVE VIDEO STREAM
# ============================================================

def generate_frames():

    while True:

        frame = detector.get_frame()

        if frame is None:

            time.sleep(0.05)
            continue

        success, buffer = cv2.imencode(
            ".jpg",
            frame,
            [
                cv2.IMWRITE_JPEG_QUALITY,
                80
            ]
        )

        if not success:
            continue

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes
            + b"\r\n"
        )

        time.sleep(0.03)


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
# YOLO STATUS API
# ============================================================

@app.route("/api/status")
def status():

    return jsonify(
        detector.get_state()
    )


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/")
def dashboard():

    return render_template_string(
        """
<!DOCTYPE html>

<html>

<head>

<title>MotoSense AI</title>

<meta name="viewport"
      content="width=device-width,
               initial-scale=1">

<style>

body {
    background: #111;
    color: white;
    font-family: Arial;
    text-align: center;
    margin: 0;
}

h1 {
    margin: 20px;
}

.video {
    width: 90%;
    max-width: 1000px;
    border: 3px solid white;
}

.panel {
    width: 90%;
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
    background: #222;
    border-radius: 10px;
    text-align: left;
}

.status {
    font-size: 24px;
    font-weight: bold;
}

.green {
    color: #00ff00;
}

.yellow {
    color: #ffff00;
}

.red {
    color: #ff0000;
}

</style>

</head>

<body>

<h1>🏍️ MotoSense AI</h1>

<img
    class="video"
    src="/video"
>

<div class="panel">

<div id="status"
     class="status">
STATUS: STARTING
</div>

<p id="object">
OBJECT: -
</p>

<p id="confidence">
CONFIDENCE: -
</p>

<p id="area">
AREA: -
</p>

</div>

<script>

async function updateStatus() {

    try {

        const response =
            await fetch("/api/status");

        const data =
            await response.json();

        const status =
            document.getElementById("status");

        status.innerText =
            "STATUS: " +
            data.status +
            " | DANGER: " +
            data.danger_level;

        status.className =
            "status " +
            data.danger_level.toLowerCase();

        document.getElementById(
            "object"
        ).innerText =
            "OBJECT: " +
            (data.object || "None");

        document.getElementById(
            "confidence"
        ).innerText =
            "CONFIDENCE: " +
            (data.confidence ?? "None");

        document.getElementById(
            "area"
        ).innerText =
            "AREA: " +
            data.box_area_ratio;

    }

    catch (error) {

        console.log(error);

    }

}

setInterval(
    updateStatus,
    200
);

updateStatus();

</script>

</body>

</html>
"""
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    print(
        "[SERVER] Open "
        "http://<RASPBERRY_PI_IP>:5000"
    )

    app.run(
        host="0.0.0.0",
        port=5000,
        threaded=True
    )