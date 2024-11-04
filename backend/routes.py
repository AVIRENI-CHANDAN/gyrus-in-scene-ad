"""
This module defines route registration functions for the Flask application, 
including authentication and React app serving routes.
"""

import json
import os
from functools import wraps
from http import HTTPStatus

import cv2
import jwt
import moviepy.editor as mp
import numpy as np
from flask import Flask, jsonify, request, send_from_directory, session
from jwt import PyJWKClient
from moviepy.video.fx.all import freeze
from PIL import Image
from werkzeug.exceptions import Unauthorized

from .auth import authenticate_user
from .environ import extract_environment_variable
from .exceptions import AuthError
from .settings import ALLOWED_FIELDS


def register_react_base(app):
    """Register the route to serve the React base application.

    Args:
        app: The Flask application instance.

    Returns:
        None
    """

    @app.route("/")
    @app.route("/<path:path>")
    def serve_react_app(path=""):
        """Serve React static files based on the provided path.

        Args:
            path (str): The path to the requested file.

        Returns:
            Response: The static file if found or the React index.html.
        """
        if path and path.endswith((".js", ".css", ".png", ".jpg", ".svg")):
            return send_from_directory(app.static_folder, path), HTTPStatus.OK
        return send_from_directory(app.static_folder, "index.html"), HTTPStatus.OK


def register_login_route(app):
    """Register the login route for the Flask application.

    Args:
        app: The Flask application instance.

    Returns:
        None
    """

    @app.route("/login", methods=["POST"])
    def login():
        """Authenticate the user and start a session.

        Returns:
            Response: JSON response with authentication result or error.
        """
        try:
            auth_result = authenticate_user(
                request.json["username"], request.json["password"]
            )
            session["logged_in"] = True
            session["username"] = request.json["username"]
            session["id_token"] = auth_result["IdToken"]
            return jsonify(auth_result), HTTPStatus.OK
        except AuthError as e:
            return jsonify({"error": str(e)}), e.status_code


def register_user_validation(app):
    """Register user validation routes for the Flask application.

    Args:
        app: The Flask application instance.
        aws_region (str): The AWS region for the Cognito User Pool.
        user_pool_id (str): The ID of the Cognito User Pool.
        client_id (str): The client ID for JWT token verification.

    Returns:
        None
    """
    aws_region = extract_environment_variable(
        "AWS_REGION"
    )  # Replace with your AWS region
    # AWS Cognito configuration
    user_pool_id = extract_environment_variable("USER_POOL_ID")
    client_id = extract_environment_variable("CLIENT_ID")

    def decode_id_token(id_token):
        """Decode and verify JWT token using AWS Cognito JWKS.

        Args:
            id_token (str): The JWT token to decode and verify.

        Returns:
            dict: Decoded token payload.

        Raises:
            Unauthorized: If the token is expired or invalid.
        """
        jwks_file = f"{user_pool_id}/.well-known/jwks.json"
        jwks_domain = f"https://cognito-idp.{aws_region}.amazonaws.com"
        jwks_url = f"{jwks_domain}/{jwks_file}"

        issuer_domain = f"https://cognito-idp.{aws_region}.amazonaws.com"
        issuer_url = f"{issuer_domain}/{user_pool_id}"

        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(id_token)

        try:
            return jwt.decode(
                id_token,
                key=signing_key.key,
                algorithms=["RS256"],
                audience=client_id,
                issuer=issuer_url,
            )
        except jwt.ExpiredSignatureError as e:
            raise Unauthorized("Token has expired") from e
        except jwt.InvalidTokenError as e:
            raise Unauthorized("Invalid token") from e

    def require_auth(f):
        """Decorator to require authentication for a route.

        Args:
            f (function): The route function to wrap.

        Returns:
            function: The wrapped function with authentication.
        """

        @wraps(f)
        def decorated(*args, **kwargs):
            if not session.get("logged_in"):
                return (
                    jsonify({"error": "Unauthorized access"}),
                    HTTPStatus.UNAUTHORIZED,
                )
            try:
                id_token = session.get("id_token")
                decoded_token = decode_id_token(id_token)
                return f(decoded_token=decoded_token, *args, **kwargs)
            except jwt.InvalidTokenError:
                session.clear()
                return jsonify({"error": "Invalid token"}), HTTPStatus.UNAUTHORIZED

        return decorated

    @app.route("/user-info", methods=["POST"])
    @require_auth
    def user_info(decoded_token):
        """Return user information based on allowed fields.

        Args:
            decoded_token (dict): The decoded JWT token payload.

        Returns:
            Response: JSON response with user information.
        """
        fields = request.json["fields"]
        return (
            jsonify(
                {
                    field: decoded_token[field]
                    for field in fields
                    if field in ALLOWED_FIELDS
                }
            ),
            HTTPStatus.OK,
        )


def register_user_logout(app):
    """Register the logout route for the Flask application.

    Args:
        app: The Flask application instance.

    Returns:
        None
    """

    @app.route("/logout", methods=["POST"])
    def logout():
        """Log the user out by clearing the session.

        Returns:
            Response: JSON response confirming the logout.
        """
        session.clear()
        return jsonify({"message": "Logged out successfully"}), HTTPStatus.OK


def register_video_processing(app):
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
        # Get video properties
        frame_width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # Print the dimensions
        print(f"Video Dimensions: {frame_width} x {frame_height} pixels")
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
        video_writer = cv2.VideoWriter(
            output_path, codec, fps, (frame_width, frame_height)
        )

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
                if frame_number >= start_frame:
                    print("replacing the frame", end=" ")
                print(f"Processed {frame_number}/{frame_count} frames")

        # Release resources
        video_capture.release()
        video_writer.release()
        cv2.destroyAllWindows()

    UPLOAD_FOLDER = extract_environment_variable("UPLOAD_FOLDER")
    RESULT_FOLDER = extract_environment_variable("RESULT_FOLDER")

    @app.route("/process_video", methods=["POST"])
    def process_video():
        try:
            print("Request form data:", request.form)
            video_filename = request.form.get("video_filename")
            if not video_filename:
                return jsonify({"error": "No video filename provided"}), 400

            video_path = os.path.join(UPLOAD_FOLDER, video_filename)
            if not os.path.exists(video_path):
                return jsonify({"error": "Video file not found"}), 404

            timestamps = request.form.get("timestamps")
            if not timestamps:
                return jsonify({"error": "No timestamps provided"}), 400

            timestamps = json.loads(timestamps)
            image_path = extract_environment_variable("OVERLAY_IMAGE")
            overlay_image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

            if overlay_image is None:
                return jsonify({"error": "Overlay image not found"}), 404

            print("details", image_path, timestamps, video_path)
            start_seconds = float(timestamps[0]["timestamp"])
            points = timestamps[0]["points"]
            points = [
                tuple([float(i) * 5 for i in points[0].values()]),
                tuple([float(i) * 5 for i in points[1].values()]),
                tuple([float(i) * 5 for i in points[2].values()]),
                tuple([float(i) * 5 for i in points[2].values()]),
            ]
            print("Points:", points)
            result_path = os.path.join(RESULT_FOLDER, f"result_{video_filename}")
            replace_pixels_in_quadrilateral(
                video_path,
                image_path,
                result_path,
                points,
                start_seconds,
            )

            return (
                jsonify(
                    {
                        "message": "Video processed successfully",
                        "result_path": result_path,
                    }
                ),
                500,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500
