"""
MotoSense AI
Danger Classification
"""

import threading
import time


class DangerManager:

    def __init__(self):

        self.lock = threading.Lock()

        self.state = {
            "front": "GREEN",
            "rear": "GREEN",

            "overall": "GREEN",

            "forward_collision": False,
            "rear_collision": False,

            "timestamp": None
        }


    # ========================================================
    # UPDATE FRONT
    # ========================================================

    def update_front(self, yolo_state):

        danger = yolo_state.get(
            "danger_level",
            "GREEN"
        )

        with self.lock:

            self.state[
                "front"
            ] = danger

            self.state[
                "forward_collision"
            ] = (
                danger == "RED"
            )

            self._update_overall()


    # ========================================================
    # UPDATE REAR
    # ========================================================

    def update_rear(self, rear_state):

        danger = rear_state.get(
            "danger_level",
            "GREEN"
        )

        with self.lock:

            self.state[
                "rear"
            ] = danger

            self.state[
                "rear_collision"
            ] = (
                danger == "RED"
            )

            self._update_overall()


    # ========================================================
    # OVERALL
    # ========================================================

    def _update_overall(self):

        front = self.state["front"]
        rear = self.state["rear"]

        if (
            front == "RED"
            or
            rear == "RED"
        ):

            overall = "RED"

        elif (
            front == "YELLOW"
            or
            rear == "YELLOW"
        ):

            overall = "YELLOW"

        else:

            overall = "GREEN"


        self.state["overall"] = overall

        self.state["timestamp"] = (
            time.time()
        )


    # ========================================================
    # STATE
    # ========================================================

    def get_state(self):

        with self.lock:
            return self.state.copy()