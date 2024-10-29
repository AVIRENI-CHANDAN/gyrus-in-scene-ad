import boto3
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, template_folder="frontend/build", static_folder="frontend/build")
cognito_client = boto3.client("cognito-idp", region_name="us-east-1")


# Serve React's static files
@app.route("/")
@app.route("/<path:path>")
def serve_react_app(path=""):
    if path and path.endswith((".js", ".css", ".png", ".jpg", ".svg")):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
