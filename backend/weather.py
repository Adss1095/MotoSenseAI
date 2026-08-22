"""
MotoSense AI
Basic Weather & Climate Detection

Camera:
    CLEAR
    SLIGHT_RAIN
    HEAVY_RAIN
    FOG

Device:
    Raspberry Pi CPU temperature

No SOS.
No collision LED control.
"""

import threading
import time

import cv2
import numpy as np


class WeatherDetector:

    def __init__(self, camera):

        self.camera = camera

        self.running = False
        self.thread = None

        self.lock = threading.Lock()

        self.previous_gray = None

        self.state = {
            "running": False,

            "condition": "STARTING",

            "rain": "NONE",

            "fog": False,

            "device_temperature_c": None,

            "risk": "SAFE",

            "warning": "Weather conditions normal",

            "timestamp": None,
        }

    # ========================================================
    # START
    # ========================================================

    def start(self):

        if self.running:
            return

        self.running = True

        self.thread = threading.Thread(
            target=self._loop,
            daemon=True
        )

        self.thread.start()

        print("[WEATHER] Weather detector started")

    # ========================================================
    # DEVICE TEMPERATURE
    # ========================================================

    def get_device_temperature(self):

        try:

            path = (
                "/sys/class/thermal/"
                "thermal_zone0/temp"
            )

            with open(path, "r") as file:

                value = float(
                    file.read().strip()
                )

            return round(
                value / 1000.0,
                1
            )

        except Exception:

            return None

    # ========================================================
    # WEATHER ANALYSIS
    # ========================================================

    def analyse_frame(self, frame):

        if frame is None:

            return (
                "CLEAR",
                "NONE",
                False
            )

        # ----------------------------------------------------
        # Resize for faster processing
        # ----------------------------------------------------

        small = cv2.resize(
            frame,
            (320, 240)
        )

        # CameraManager provides RGB frames
        gray = cv2.cvtColor(
            small,
            cv2.COLOR_RGB2GRAY
        )

        # ----------------------------------------------------
        # IMAGE STATISTICS
        # ----------------------------------------------------

        brightness = float(
            np.mean(gray)
        )

        contrast = float(
            np.std(gray)
        )

        # ----------------------------------------------------
        # EDGE INFORMATION
        # ----------------------------------------------------

        edges = cv2.Canny(
            gray,
            50,
            150
        )

        edge_density = (
            np.count_nonzero(edges)
            /
            edges.size
        )

        # ----------------------------------------------------
        # FOG DETECTION
        #
        # Fog generally produces:
        # - low contrast
        # - reduced edge detail
        # - washed-out image
        # ----------------------------------------------------

        fog_score = 0

        if contrast < 28:
            fog_score += 1

        if edge_density < 0.035:
            fog_score += 1

        if brightness > 100:
            fog_score += 1

        fog = fog_score >= 2

        # ----------------------------------------------------
        # RAIN DETECTION
        #
        # Compare current frame with previous frame.
        # Rain produces small moving changes/streaks.
        # ----------------------------------------------------

        rain_score = 0

        if self.previous_gray is not None:

            difference = cv2.absdiff(
                gray,
                self.previous_gray
            )

            _, motion = cv2.threshold(
                difference,
                25,
                255,
                cv2.THRESH_BINARY
            )

            motion_ratio = (
                np.count_nonzero(motion)
                /
                motion.size
            )

            # Moderate moving pixels
            if motion_ratio > 0.035:
                rain_score += 1

            # Strong movement
            if motion_ratio > 0.09:
                rain_score += 2

        self.previous_gray = gray

        # ----------------------------------------------------
        # DECISION
        # ----------------------------------------------------

        if fog:

            condition = "FOG"
            rain = "NONE"

        elif rain_score >= 2:

            condition = "HEAVY_RAIN"
            rain = "HEAVY"

        elif rain_score >= 1:

            condition = "SLIGHT_RAIN"
            rain = "SLIGHT"

        else:

            condition = "CLEAR"
            rain = "NONE"

        return (
            condition,
            rain,
            fog
        )

    # ========================================================
    # RISK
    # ========================================================

    def calculate_risk(
        self,
        condition,
        temperature
    ):

        # ----------------------------------------------------
        # Dangerous visibility / rainfall
        # ----------------------------------------------------

        if condition in (
            "HEAVY_RAIN",
            "FOG"
        ):

            return (
                "DANGEROUS",
                "Poor visibility / heavy weather"
            )

        # ----------------------------------------------------
        # Slight rain
        # ----------------------------------------------------

        if condition == "SLIGHT_RAIN":

            return (
                "CAUTION",
                "Road may be wet"
            )

        # ----------------------------------------------------
        # Device temperature warning
        #
        # This is NOT outdoor temperature.
        # ----------------------------------------------------

        if (
            temperature is not None
            and
            temperature >= 80
        ):

            return (
                "CAUTION",
                "Raspberry Pi device temperature high"
            )

        return (
            "SAFE",
            "Weather conditions normal"
        )

    # ========================================================
    # LOOP
    # ========================================================

    def _loop(self):

        while self.running:

            try:

                frame = (
                    self.camera.get_latest_frame()
                )

                if frame is None:

                    time.sleep(0.5)

                    continue

                condition, rain, fog = (
                    self.analyse_frame(frame)
                )

                temperature = (
                    self.get_device_temperature()
                )

                risk, warning = (
                    self.calculate_risk(
                        condition,
                        temperature
                    )
                )

                new_state = {

                    "running": True,

                    "condition": condition,

                    "rain": rain,

                    "fog": fog,

                    "device_temperature_c":
                        temperature,

                    "risk": risk,

                    "warning": warning,

                    "timestamp": time.time(),
                }

                with self.lock:

                    self.state = new_state

            except Exception as error:

                print(
                    f"[WEATHER] Error: {error}"
                )

            time.sleep(1)

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

            self.thread = None