"""
MotoSense AI
Danger Assessment

Converts YOLO bounding-box size into a
basic proximity/danger level.

This is an image-based proximity estimate,
not a physical distance measurement.
"""


def calculate_danger(
    bbox,
    frame_width,
    frame_height
):
    """
    Calculate danger level from bounding-box area.

    Returns:
        danger_level
        proximity_ratio
    """

    if not bbox:
        return "SAFE", 0.0

    x1, y1, x2, y2 = bbox

    box_width = max(0, x2 - x1)
    box_height = max(0, y2 - y1)

    box_area = box_width * box_height
    frame_area = frame_width * frame_height

    if frame_area <= 0:
        return "SAFE", 0.0

    proximity_ratio = box_area / frame_area

    if proximity_ratio >= 0.35:
        danger_level = "CRITICAL"

    elif proximity_ratio >= 0.15:
        danger_level = "WARNING"

    else:
        danger_level = "SAFE"

    return (
        danger_level,
        round(proximity_ratio, 3)
    )