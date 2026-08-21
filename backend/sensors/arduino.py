"""
MotoSense AI
Arduino Serial Interface
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


                data = json.loads(line)


                with self.lock:

                    self.state.update({

                        "connected": True,

                        "distance_m":
                            data.get(
                                "distance_m"
                            ),

                        "danger_level":
                            data.get(
                                "danger_level",
                                "GREEN"
                            ),

                        "led_zone":
                            data.get(
                                "led_zone",
                                "GREEN"
                            ),

                        "buzzer":
                            data.get(
                                "buzzer",
                                False
                            ),

                        "timestamp":
                            time.time()
                    })


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
    # SEND ADAPTIVE THRESHOLDS
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