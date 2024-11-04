import cv2
import numpy as np


def replace_pixels_in_quadrilateral(
    video_path, image_path, output_path, points, start_time_sec
):
    """
    Replaces pixels in a specific quadrilateral region of each video frame with a resized target image,
    starting from a specified timestamp.

    Parameters:
    - video_path: Path to the input video file.
    - image_path: Path to the target image file.
    - output_path: Path for saving the output video.
    - points: A list of four (x, y) tuples representing the vertices of the quadrilateral
            (top-left, top-right, bottom-right, bottom-left).
    - start_time_sec: Time in seconds after which the image placement should start.
    """
    # Load the video
    video_capture = cv2.VideoCapture(video_path)
    if not video_capture.isOpened():
        return
    # Get video properties
    frame_width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(video_capture.get(cv2.CAP_PROP_FPS))
    frame_count = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
    codec = cv2.VideoWriter_fourcc(*"mp4v")  # Codec for .mp4 output
    # Calculate the frame number to start from based on the start time in seconds
    start_frame = int(start_time_sec * fps)
    # Load the image
    image = cv2.imread(image_path)
    if image is None:
        return

    # Define the destination points (target area in the frame)
    pts_dst = np.array(points, dtype="float32")

    # Calculate the width and height of the bounding box for the target region
    width = int(
        max(
            np.linalg.norm(pts_dst[0] - pts_dst[1]),
            np.linalg.norm(pts_dst[2] - pts_dst[3]),
        )
    )
    height = int(
        max(
            np.linalg.norm(pts_dst[0] - pts_dst[3]),
            np.linalg.norm(pts_dst[1] - pts_dst[2]),
        )
    )

    # Resize the image to match the target region dimensions
    resized_image = cv2.resize(image, (width, height))

    # Define the source points as the corners of the resized image
    pts_src = np.array(
        [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]],
        dtype="float32",
    )

    # Compute the homography matrix
    matrix = cv2.getPerspectiveTransform(pts_src, pts_dst)

    # Create a video writer to save the output
    video_writer = cv2.VideoWriter(output_path, codec, fps, (frame_width, frame_height))

    frame_number = 0
    while video_capture.isOpened():
        ret, frame = video_capture.read()
        if not ret:
            break

        # Process only if the current frame number is after the specified start frame
        if frame_number >= start_frame:
            # Warp the resized image onto the frame using the homography matrix
            warped_image = cv2.warpPerspective(
                resized_image, matrix, (frame_width, frame_height)
            )

            # Create a mask from the warped image to isolate the region
            mask = np.zeros((frame_height, frame_width), dtype=np.uint8)
            cv2.fillConvexPoly(mask, pts_dst.astype(int), 255)

            # Invert the mask to black out the region in the frame
            mask_inv = cv2.bitwise_not(mask)
            frame_bg = cv2.bitwise_and(frame, frame, mask=mask_inv)

            # Combine the background frame with the warped image region
            frame_final = cv2.add(
                frame_bg, cv2.bitwise_and(warped_image, warped_image, mask=mask)
            )

            # Write the modified frame to the output video
            video_writer.write(frame_final)
        else:
            # Write the original frame before the start time
            video_writer.write(frame)

        frame_number += 1
        if frame_number % 50 == 0:
            print(f"Processed {frame_number}/{frame_count} frames")

    # Release resources
    video_capture.release()
    video_writer.release()
    cv2.destroyAllWindows()


# Example usage:
replace_pixels_in_quadrilateral(
    r"D:\Projects\gyrus-in-scene-ad\uploads\602d657d-da98-4049-9b4d-ce4e333101a3.mp4",
    r"D:\Projects\gyrus-in-scene-ad\backend\fixed.jpeg",
    r"D:\Projects\gyrus-in-scene-ad\results\output_video.mp4",
    [(150, 150), (250, 150), (200, 300), (150, 300)],
    start_time_sec=3,
)
