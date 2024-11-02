import os
from datetime import timedelta
from http import HTTPStatus  # Import HTTPStatus for response codes

import boto3
import jwt
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from jwt import PyJWKClient

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder="frontend/build", static_folder="frontend/build")
secret_key = os.getenv("SECRET_KEY")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is required")
app.secret_key = secret_key
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=1)  # Session expiration time
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True  # Requires HTTPS

aws_region = os.getenv("AWS_REGION")  # Replace with your AWS region

cognito_client = boto3.client("cognito-idp", region_name=aws_region)

# AWS Cognito configuration
user_pool_id = os.getenv("USER_POOL_ID")
client_id = os.getenv("CLIENT_ID")


def decode_id_token(id_token):
    """Decode and verify JWT token using AWS Cognito JWKS."""
    global aws_region, user_pool_id, client_id

    # JWKS URL for the specified Cognito User Pool
    jwks_url = f"https://cognito-idp.{aws_region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"

    # Use PyJWKClient to get the key
    jwks_client = PyJWKClient(jwks_url)
    signing_key = jwks_client.get_signing_key_from_jwt(id_token)

    try:
        # Decode and verify the token
        return jwt.decode(
            id_token,
            key=signing_key.key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=f"https://cognito-idp.{aws_region}.amazonaws.com/{user_pool_id}",
        )
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token has expired") from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e


@app.route("/")
@app.route("/<path:path>")
def serve_react_app(path=""):
    """Serve React static files."""
    if path and path.endswith((".js", ".css", ".png", ".jpg", ".svg")):
        return send_from_directory(app.static_folder, path), HTTPStatus.OK
    return send_from_directory(app.static_folder, "index.html"), HTTPStatus.OK


@app.route("/login", methods=["POST"])
def login():
    try:
        # Authenticate user with USER_PASSWORD_AUTH
        response = cognito_client.initiate_auth(
            ClientId=client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": request.json["username"],
                "PASSWORD": request.json["password"],
            },
        )
        # Check if a new password is required and prompt for it
        if (
            "ChallengeName" in response
            and response["ChallengeName"] == "NEW_PASSWORD_REQUIRED"
        ):
            # This flow needs the client app to handle the NEW_PASSWORD_REQUIRED challenge securely
            return jsonify({"error": "New password required"}), HTTPStatus.FORBIDDEN
        # Access tokens and other data from AuthenticationResult
        auth_result = response["AuthenticationResult"]
        session["logged_in"] = True
        session["username"] = request.json["username"]
        session["id_token"] = auth_result["IdToken"]
        return jsonify(auth_result), HTTPStatus.OK
    except cognito_client.exceptions.NotAuthorizedException:
        return jsonify({"error": "Invalid credentials"}), HTTPStatus.UNAUTHORIZED
    except cognito_client.exceptions.PasswordResetRequiredException:
        return jsonify({"error": "Password reset required"}), HTTPStatus.FORBIDDEN
    except Exception as e:
        # Log the error securely
        return (
            jsonify({"error": "An internal server error occurred"}),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


@app.route("/user-info", methods=["POST"])
def user_info():
    fields = request.json["fields"]
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized access"}), HTTPStatus.UNAUTHORIZED
    id_token = session.get("id_token")
    decoded_response = decode_id_token(id_token)
    api_response = {field: decoded_response[field] for field in fields}
    return jsonify(api_response), HTTPStatus.OK


@app.route("/logout", methods=["POST"])
def logout():
    """Log the user out by clearing the session."""
    session.clear()
    return jsonify({"message": "Logged out successfully"}), HTTPStatus.OK


if __name__ == "__main__":
    CORS(
        app,
        supports_credentials=True,
        origins=["http://localhost:3000", "http://localhost:5000"],
    )
    app.run(debug=True)
