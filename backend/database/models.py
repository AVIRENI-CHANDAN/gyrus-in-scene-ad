from sqlalchemy import func

from .db import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(
        db.String(255), primary_key=True
    )  # Use 'sub' from Cognito as the unique ID
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    projects = db.relationship("Project", backref="owner", lazy=True)


class Project(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    created_at = db.Column(
        db.DateTime, default=func.now()
    )  # Use db.func for current timestamp
    user_id = db.Column(db.String(255), db.ForeignKey("users.id"), nullable=False)
    file_path = db.Column(db.String(300), nullable=True)  # Column to store file path
