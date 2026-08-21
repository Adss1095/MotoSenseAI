"""
MotoSense AI
SOS / Crash Detection
"""

import threading
import time


class SOSManager:

    def __init__(
        self,
        critical_seconds=10
    ):

        self.critical_seconds = (
            critical_seconds
        )

        self.lock = threading.Lock()

        self.critical_since = None

        self.sos_active = False

        self.state = {
            "critical": False,
            "critical_duration": 0.0,

            "sos_active": False,

            "reason": None,

            "timestamp": None
        }


    # ========================================================
    # UPDATE
    # ========================================================

    def update(
        self,
        overall_danger
    ):

        now = time.time()

        with self.lock:

            if overall_danger == "RED":

                if self.critical_since is None:

                    self.critical_since = now


                duration = (
                    now -
                    self.critical_since
                )

                self.state[
                    "critical"
                ] = True

                self.state[
                    "critical_duration"
                ] = round(
                    duration,
                    2
                )


                if (
                    duration >=
                    self.critical_seconds
                ):

                    if not self.sos_active:

                        self.sos_active = True

                        self.state[
                            "sos_active"
                        ] = True

                        self.state[
                            "reason"
                        ] = (
                            "CRITICAL_ZONE_"
                            "10_SECONDS"
                        )

                        print(
                            "!!! SOS EMERGENCY ACTIVATED !!!"
                        )


            else:

                self.critical_since = None

                self.state[
                    "critical"
                ] = False

                self.state[
                    "critical_duration"
                ] = 0.0

                # Reset after danger clears.
                # The SOS event itself is preserved
                # until manually reset.
                

            self.state[
                "timestamp"
            ] = now


    # ========================================================
    # MANUAL RESET
    # ========================================================

    def reset(self):

        with self.lock:

            self.critical_since = None

            self.sos_active = False

            self.state = {
                "critical": False,
                "critical_duration": 0.0,

                "sos_active": False,

                "reason": None,

                "timestamp": time.time()
            }


    # ========================================================
    # STATE
    # ========================================================

    def get_state(self):

        with self.lock:
            return self.state.copy()