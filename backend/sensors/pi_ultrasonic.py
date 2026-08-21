"""
MotoSense AI
Front HC-SR04 Ultrasonic Sensor
Raspberry Pi 4B
"""

import threading
import time

import RPi.GPIO as GPIO


class FrontUltrasonic:

    def __init__(
        self,
        trig_pin,
        echo_pin
    ):

        self.trig_pin = trig_pin
        self.echo_pin = echo_pin

        self.running = False

        self.distance = None

        self.thread = None

        self.lock = threading.Lock()


        GPIO.setmode(GPIO.BCM)

        GPIO.setup(
            self.trig_pin,
            GPIO.OUT,
            initial=GPIO.LOW
        )

        GPIO.setup(
            self.echo_pin,
            GPIO.IN
        )


    # ========================================================
    # READ DISTANCE
    # ========================================================

    def measure(self):

        GPIO.output(
            self.trig_pin,
            GPIO.LOW
        )

        time.sleep(
            0.000002
        )

        GPIO.output(
            self.trig_pin,
            GPIO.HIGH
        )

        time.sleep(
            0.00001
        )

        GPIO.output(
            self.trig_pin,
            GPIO.LOW
        )


        timeout = time.monotonic() + 0.03

        while GPIO.input(
            self.echo_pin
        ) == GPIO.LOW:

            if time.monotonic() > timeout:
                return None


        pulse_start = time.monotonic()

        timeout = time.monotonic() + 0.03

        while GPIO.input(
            self.echo_pin
        ) == GPIO.HIGH:

            if time.monotonic() > timeout:
                return None


        pulse_end = time.monotonic()

        duration = (
            pulse_end - pulse_start
        )

        distance_cm = (
            duration * 34300
        ) / 2


        if (
            distance_cm < 2
            or
            distance_cm > 400
        ):

            return None


        return round(
            distance_cm / 100,
            2
        )


    # ========================================================
    # LOOP
    # ========================================================

    def _loop(self):

        while self.running:

            distance = self.measure()

            with self.lock:

                self.distance = distance

            time.sleep(0.1)


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


    # ========================================================
    # STATE
    # ========================================================

    def get_state(self):

        with self.lock:

            return {
                "connected": self.running,
                "distance_m": self.distance,
                "timestamp": time.time()
            }


    # ========================================================
    # STOP
    # ========================================================

    def stop(self):

        self.running = False

        GPIO.output(
            self.trig_pin,
            GPIO.LOW
        )

        GPIO.cleanup([
            self.trig_pin,
            self.echo_pin
        ])