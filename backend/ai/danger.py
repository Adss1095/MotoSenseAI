def calculate_danger(
    detection,
    frame_width,
    frame_height
):
    x1, y1, x2, y2 = detection["bbox"]

    box_width = max(0, x2 - x1)
    box_height = max(0, y2 - y1)

    box_area = box_width * box_height
    frame_area = frame_width * frame_height

    if frame_area == 0:
        return "SAFE"

    occupied_ratio = box_area / frame_area

    if occupied_ratio >= 0.35:
        return "CRITICAL"

    if occupied_ratio >= 0.15:
        return "WARNING"

    return "SAFE"