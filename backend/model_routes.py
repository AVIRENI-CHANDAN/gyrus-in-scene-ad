import os
import uuid

from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename

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
                    "file_path": project.file_path,  # Include file path if needed
                }
                for project in projects
            ]
        )

    @app.route("/projects", methods=["POST"])
    @cognito_token_required
    def create_project():
        print("Inside the create_project function")

        user_id = request.user  # Access the user ID set by the decorator

        # Access form data and files
        name = request.form.get("name")
        description = request.form.get("description")
        file = request.files.get("file")

        if not name:
            return jsonify({"error": "Project name is required"}), 400

        new_filename = None
        if file:
            # Generate a unique ID for the file
            unique_id = str(uuid.uuid4())
            original_filename = secure_filename(file.filename)
            file_extension = os.path.splitext(original_filename)[1]
            new_filename = f"{unique_id}{file_extension}"
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], new_filename)

            # Save the file with the new name
            file.save(file_path)
            print(f"File saved to {file_path}")

        # Create a new project entry in the database
        new_project = Project(
            name=name,
            description=description or "",
            user_id=user_id,
            file_path=new_filename,  # Store the new filename in the project
        )
        add_to_db_session(new_project)

        return (
            jsonify(
                {"message": "Project created successfully!", "filename": new_filename}
            ),
            201,
        )
