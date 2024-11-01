import os
from datetime import timedelta

import boto3
from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS

app = Flask(__name__, template_folder="frontend/build", static_folder="frontend/build")
app.secret_key = os.getenv("SECRET_KEY")
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=1)  # Session expiration time

cognito_client = boto3.client("cognito-idp", region_name="us-east-1")


# Serve React's static files
@app.route("/")
@app.route("/<path:path>")
def serve_react_app(path=""):
    if path and path.endswith((".js", ".css", ".png", ".jpg", ".svg")):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


@app.route("/login", methods=["POST"])
def login():
    print("data", request.json)
    print(request.get_json())
    try:
        # Initial login attempt with USER_PASSWORD_AUTH
        response = cognito_client.initiate_auth(
            ClientId="758360o6l7a0rkecb65mo7r0gd",
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": request.json["username"],
                "PASSWORD": request.json["password"],
            },
        )
        print("Cognito response", response)

        # Check if the response requires a new password
        if (
            "ChallengeName" in response
            and response["ChallengeName"] == "NEW_PASSWORD_REQUIRED"
        ):
            new_password = (
                "$YourNewPassword123"  # Set or collect a new password securely
            )
            response = cognito_client.respond_to_auth_challenge(
                ClientId="758360o6l7a0rkecb65mo7r0gd",
                ChallengeName="NEW_PASSWORD_REQUIRED",
                Session=response["Session"],
                ChallengeResponses={
                    "USERNAME": request.json["username"],
                    "NEW_PASSWORD": new_password,
                },
            )

        # Mark the session as logged in with tokens
        session["logged_in"] = True
        session["username"] = request.json["username"]
        session["access_token"] = response["AuthenticationResult"]["AccessToken"]

        return jsonify(response["AuthenticationResult"])

    except cognito_client.exceptions.NotAuthorizedException:
        return jsonify({"error": "Invalid credentials"}), 401
    except cognito_client.exceptions.PasswordResetRequiredException:
        return jsonify({"error": "Password reset required"}), 403
    except Exception as e:
        print("Error", e)
        return jsonify({"error": str(e)}), 500


@app.route("/protected", methods=["GET"])
def protected():
    # Check if the user is logged in
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized access"}), 401
    return jsonify({"message": f"Welcome {session['username']}!"})


if __name__ == "__main__":
    CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])
    app.run(debug=True)
