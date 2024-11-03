from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required

from .database import Project, db


def register_project_model_routes(app):
    @app.route("/projects", methods=["GET"])
    @jwt_required()
    def get_projects():
        user_id = get_jwt_identity()  # Get the user 'sub' from the JWT token
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
    @jwt_required()
    def create_project():
        user_id = get_jwt_identity()  # Get the user 'sub' from the JWT token
        data = request.get_json()
        new_project = Project(
            name=data["name"], description=data.get("description", ""), user_id=user_id
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify({"message": "Project created successfully!"}), 201
