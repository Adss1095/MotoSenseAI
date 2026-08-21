"""
MotoSense AI
Raspberry Pi Camera Module 3
"""

import threading
import time

from picamera2 import Picamera2

from config import CAMERA_WIDTH, CAMERA_HEIGHT


class CameraManager:

    def __init__(self):

        self.camera = None
        self.running = False

        self.lock = threading.Lock()

        self.latest_frame = None
        self.last_frame_time = None


    # ========================================================
    # START CAMERA
    # ========================================================

    def start(self):

        if self.running:
            return True

        try:

            self.camera = Picamera2()

            configuration = (
                self.camera
                .create_preview_configuration(
                    main={
                        "size": (
                            CAMERA_WIDTH,
                            CAMERA_HEIGHT
                        ),
                        "format": "RGB888"
                    }
                )
            )

            self.camera.configure(configuration)

            self.camera.start()

            time.sleep(1)

            self.running = True

            return True

        except Exception as error:

            print(
                f"[CAMERA] Start error: {error}"
            )

            self.running = False

            return False


    # ========================================================
    # CAPTURE
    # ========================================================

    def capture(self):

        if not self.running or self.camera is None:
            return None

        try:

            frame = self.camera.capture_array()

            with self.lock:

                self.latest_frame = frame
                self.last_frame_time = time.time()

            return frame

        except Exception as error:

            print(
                f"[CAMERA] Capture error: {error}"
            )

            return None


    # ========================================================
    # LATEST FRAME
    # ========================================================

    def get_latest_frame(self):

        with self.lock:
            return self.latest_frame


    # ========================================================
    # STATUS
    # ========================================================

    def get_status(self):

        return {
            "connected": self.running,
            "width": CAMERA_WIDTH,
            "height": CAMERA_HEIGHT,
            "last_frame": self.last_frame_time
        }


    # ========================================================
    # STOP
    # ========================================================

    def stop(self):

        self.running = False

        if self.camera:

            try:
                self.camera.stop()
            except Exception:
                pass

            self.camera = None