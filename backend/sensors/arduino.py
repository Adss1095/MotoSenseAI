"""
MotoSense AI
Arduino Serial Interface

Reads the EXISTING Arduino output:

    Distance: 24
    SOS_PENDING
    SOS_ACTIVE
    SOS_CANCELLED
    SENSOR_ERROR

Arduino code is NOT modified.
"""

import json
import threading
import time

import serial


class ArduinoManager:

    def __init__(
        self,
        port,
        baudrate=115200
    ):

        self.port = port
        self.baudrate = baudrate

        self.serial = None

        self.running = False

        self.thread = None

        self.lock = threading.Lock()

        self.state = {
            "connected": False,

            "distance_m": None,

            "danger_level": "GREEN",

            "led_zone": "GREEN",

            "buzzer": False,

            "sos": False,

            "sos_status": "NORMAL",

            "timestamp": None
        }


    # ========================================================
    # START
    # ========================================================

    def start(self):

        if self.running:
            return

        try:

            self.serial = serial.Serial(
                self.port,
                self.baudrate,
                timeout=1
            )

            time.sleep(2)

            self.running = True

            self.thread = threading.Thread(
                target=self._read_loop,
                daemon=True
            )

            self.thread.start()

            print(
                f"[ARDUINO] Connected: {self.port}"
            )

        except Exception as error:

            print(
                f"[ARDUINO] Connection failed: {error}"
            )

            self.running = False


    # ========================================================
    # READ LOOP
    # ========================================================

    def _read_loop(self):

        while self.running:

            try:

                line = (
                    self.serial
                    .readline()
                    .decode(
                        "utf-8",
                        errors="ignore"
                    )
                    .strip()
                )

                if not line:
                    continue


                # =================================================
                # DISTANCE
                # =================================================

                if line.startswith("Distance:"):

                    value = (
                        line
                        .replace(
                            "Distance:",
                            ""
                        )
                        .strip()
                    )

                    distance_cm = float(value)

                    distance_m = (
                        distance_cm / 100.0
                    )


                    # =================================================
                    # DETERMINE DASHBOARD ZONE
                    #
                    # This follows the EXISTING Arduino thresholds:
                    #
                    # > 30 cm  = GREEN
                    # 30-21 cm = GREEN
                    # 20-11 cm = YELLOW
                    # 10-5 cm  = RED
                    # < 5 cm   = RED
                    # =================================================

                    if distance_cm > 30:

                        danger_level = "GREEN"
                        led_zone = "GREEN"
                        buzzer = False

                    elif distance_cm > 20:

                        danger_level = "GREEN"
                        led_zone = "GREEN"
                        buzzer = False

                    elif distance_cm > 10:

                        danger_level = "YELLOW"
                        led_zone = "YELLOW"
                        buzzer = False

                    elif distance_cm >= 5:

                        danger_level = "RED"
                        led_zone = "RED"
                        buzzer = False

                    else:

                        danger_level = "RED"
                        led_zone = "RED"
                        buzzer = True


                    with self.lock:

                        self.state.update({

                            "connected": True,

                            "distance_m":
                                distance_m,

                            "danger_level":
                                danger_level,

                            "led_zone":
                                led_zone,

                            "buzzer":
                                buzzer,

                            "timestamp":
                                time.time()
                        })

                    continue


                # =================================================
                # SOS PENDING
                # =================================================

                if line == "SOS_PENDING":

                    with self.lock:

                        self.state.update({

                            "connected": True,

                            "sos": True,

                            "sos_status":
                                "PENDING",

                            "danger_level":
                                "RED",

                            "led_zone":
                                "RED",

                            "buzzer":
                                True,

                            "timestamp":
                                time.time()
                        })

                    continue


                # =================================================
                # SOS ACTIVE
                # =================================================

                if line == "SOS_ACTIVE":

                    with self.lock:

                        self.state.update({

                            "connected": True,

                            "sos": True,

                            "sos_status":
                                "ACTIVE",

                            "danger_level":
                                "RED",

                            "led_zone":
                                "RED",

                            "buzzer":
                                True,

                            "timestamp":
                                time.time()
                        })

                    continue


                # =================================================
                # SOS CANCELLED
                # =================================================

                if line == "SOS_CANCELLED":

                    with self.lock:

                        self.state.update({

                            "connected": True,

                            "sos": False,

                            "sos_status":
                                "NORMAL",

                            "buzzer":
                                False,

                            "timestamp":
                                time.time()
                        })

                    continue


                # =================================================
                # SENSOR ERROR
                # =================================================

                if line == "SENSOR_ERROR":

                    with self.lock:

                        self.state.update({

                            "connected": True,

                            "distance_m":
                                None,

                            "danger_level":
                                "GREEN",

                            "led_zone":
                                "GREEN",

                            "buzzer":
                                False,

                            "timestamp":
                                time.time()
                        })

                    continue


            except Exception as error:

                print(
                    f"[ARDUINO] Read error: {error}"
                )

                with self.lock:

                    self.state[
                        "connected"
                    ] = False

                time.sleep(1)


    # ========================================================
    # SEND COMMAND
    # ========================================================

    def send_command(
        self,
        command
    ):

        if not self.running:
            return False

        try:

            self.serial.write(
                f"{command}\n".encode()
            )

            return True

        except Exception as error:

            print(
                f"[ARDUINO] Send error: {error}"
            )

            return False


    # ========================================================
    # CANCEL SOS
    # ========================================================

    def cancel_sos(self):

        return self.send_command(
            "C"
        )


    # ========================================================
    # ADAPTIVE THRESHOLDS
    # ========================================================

    def send_thresholds(
        self,
        green,
        yellow,
        red
    ):

        if not self.running:
            return False

        try:

            message = (
                f"THRESHOLDS,"
                f"{green:.2f},"
                f"{yellow:.2f},"
                f"{red:.2f}\n"
            )

            self.serial.write(
                message.encode()
            )

            return True

        except Exception as error:

            print(
                f"[ARDUINO] Send error: {error}"
            )

            return False


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

        if self.serial:

            try:

                self.serial.close()

            except Exception:

                pass

            self.serial = None