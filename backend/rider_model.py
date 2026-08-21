"""
MotoSense AI
Mock Rider Behaviour Model

This is temporary.

Real rider telemetry will eventually replace this
with actual speed / braking / acceleration data.
"""

import random
import threading
import time


class RiderBehaviourModel:

    def __init__(self):

        self.lock = threading.Lock()

        self.running = False

        self.thread = None

        self.state = {

            "speed_kmh": 0.0,

            "braking_intensity": 0.0,

            "acceleration": 0.0,

            "reaction_time_s": 1.0,

            "rider_profile":
                "NORMAL",

            "adaptive_factor":
                1.0,

            "timestamp":
                time.time()
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


    # ========================================================
    # MOCK DATA
    # ========================================================

    def _loop(self):

        while self.running:

            speed = random.uniform(
                20,
                60
            )

            braking = random.uniform(
                0,
                1
            )

            acceleration = random.uniform(
                -2.5,
                2.5
            )

            reaction = random.uniform(
                0.6,
                1.8
            )


            # ------------------------------------------------
            # RIDER PROFILE
            # ------------------------------------------------

            if (
                braking > 0.75
                or
                reaction > 1.5
            ):

                profile = "CAUTIOUS"

                factor = 1.20

            elif (
                braking < 0.30
                and
                reaction < 1.0
            ):

                profile = "RESPONSIVE"

                factor = 0.90

            else:

                profile = "NORMAL"

                factor = 1.00


            with self.lock:

                self.state = {

                    "speed_kmh":
                        round(
                            speed,
                            1
                        ),

                    "braking_intensity":
                        round(
                            braking,
                            2
                        ),

                    "acceleration":
                        round(
                            acceleration,
                            2
                        ),

                    "reaction_time_s":
                        round(
                            reaction,
                            2
                        ),

                    "rider_profile":
                        profile,

                    "adaptive_factor":
                        factor,

                    "timestamp":
                        time.time()
                }


            time.sleep(5)


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