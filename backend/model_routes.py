from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required

from .auth import cognito_token_required
from .database import Project, add_to_db_session


def register_project_model_routes(app):
    @app.route("/projects", methods=["GET"])
    @cognito_token_required
    def get_projects():
        user_id = request.user  # Access the user ID set by the decorator
        projects = Project.query.filter_by(user_id=user_id).all()
        return jsonify(
            [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "created_at": project.created_at,
                }
                for project in projects
            ]
        )

    @app.route("/projects", methods=["POST"])
    @cognito_token_required
    def create_project():
        print("Inside the create_project function")

        user_id = request.user  # Access the user ID set by the decorator
        data = request.get_json()

        new_project = Project(
            name=data["name"], description=data.get("description", ""), user_id=user_id
        )
        add_to_db_session(new_project)
        return jsonify({"message": "Project created successfully!"}), 201
