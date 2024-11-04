"""
This module defines route registration functions for the Flask application, 
including authentication and React app serving routes.
"""

import json
import os
from functools import wraps
from http import HTTPStatus

import jwt
import moviepy.editor as mp
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
    UPLOAD_FOLDER = extract_environment_variable("UPLOAD_FOLDER")
    RESULT_FOLDER = extract_environment_variable("RESULT_FOLDER")

    @app.route("/process_video", methods=["POST"])
    def process_video():
        try:
            # Retrieve the video filename from the form data
            video_filename = request.form.get("video_filename")
            print("Video file name", video_filename)
            if not video_filename:
                return jsonify({"error": "No video filename provided"}), 400

            video_path = os.path.join(UPLOAD_FOLDER, video_filename)

            # Check if the file exists
            if not os.path.exists(video_path):
                return jsonify({"error": "Video file not found"}), 404
            print("Found the video file")

            # Get and parse the timestamps from the request
            timestamps = request.form.get("timestamps")
            if not timestamps:
                return jsonify({"error": "No timestamps provided"}), 400

            timestamps = json.loads(timestamps)  # Parse the JSON string
            print("Got the timestamps", timestamps)
            image_path = extract_environment_variable("OVERLAY_IMAGE")

            # Process the video with MoviePy
            video = mp.VideoFileClip(video_path)
            clips = []

            print("Looping over timestamps")
            for entry in timestamps:
                timestamp = float(entry["timestamp"])  # Ensure timestamp is a float
                points = entry["points"]  # Points array with x and y as percentages
                print("Preparing overlay image clip")
                overlay_image_clip = (
                    mp.ImageClip(image_path)
                    .set_start(timestamp)
                    .set_duration(1)  # Adjust duration as needed
                    .resize((100, 100), Image.Resampling.LANCZOS)  # Resize as needed
                    .set_position((points[0]["x"], points[0]["y"]))
                )
                clips.append(overlay_image_clip)
                print("Overlay clip added")
            print("End of timestamp loops")
            final_video = mp.CompositeVideoClip([video] + clips)
            print("Made the final video")
            result_path = os.path.join(RESULT_FOLDER, f"processed_{video_filename}")
            final_video.write_videofile(result_path, codec="libx264")

            return (
                jsonify(
                    {
                        "message": "Video processed successfully",
                        "result_path": result_path,
                    }
                ),
                200,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500
