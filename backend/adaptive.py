"""
MotoSense AI
Adaptive Safety Radius
"""


class AdaptiveSafety:

    def __init__(self):

        self.state = {
            "green_m": 3.0,
            "yellow_m": 2.0,
            "red_m": 1.2
        }


    def calculate(
        self,
        rider
    ):

        speed = rider.get(
            "speed_kmh",
            30
        )

        factor = rider.get(
            "adaptive_factor",
            1.0
        )


        # Base distance increases with speed.
        speed_component = (
            speed * 0.035
        )


        green = (
            3.0
            + speed_component
        ) * factor

        yellow = (
            2.0
            + speed_component * 0.65
        ) * factor

        red = (
            1.2
            + speed_component * 0.35
        ) * factor


        # Maintain proper ordering.

        yellow = min(
            yellow,
            green - 0.2
        )

        red = min(
            red,
            yellow - 0.2
        )

        red = max(
            red,
            0.8
        )


        self.state = {

            "green_m":
                round(green, 2),

            "yellow_m":
                round(yellow, 2),

            "red_m":
                round(red, 2)
        }


        return self.state.copy()