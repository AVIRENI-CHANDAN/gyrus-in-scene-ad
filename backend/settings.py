"""
This module defines the settings and configuration values for the application.
"""

from .environ import extract_environment_variable

ALLOWED_FIELDS = {
    "birthdate",
    "email",
    "email_verified",
    "exp",
    "auth_time",
    "iat",
    "gender",
    "phone_number",
    "phone_number_verified",
    "preferred_username",
}
DEBUG = extract_environment_variable("DEBUG", "false").lower() == "true"
ALLOWED_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5000"]
TEMPLATE_FOLDER = extract_environment_variable("TEMPLATE_FOLDER")
STATIC_FOLDER = extract_environment_variable("STATIC_FOLDER")
