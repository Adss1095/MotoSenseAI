from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.get("/")
def home():
     return jsonify({
        "project": "MotoSense AI",
        "backend": True,
        "platform": "Raspberry Pi 4B",
        "status": "RUNNING",
        "version": "1.0.0"
    })


@app.get("/api/status")
def status():
    return jsonify({
        "backend": True,
        "camera": "READY",
        "ai": "NOT_LOADED",
        "platform": "Raspberry Pi 4B"
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )