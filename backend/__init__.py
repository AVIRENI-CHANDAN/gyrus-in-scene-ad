"""
This module initializes the backend package by importing key functions and constants
for use throughout the application.
"""

from .application import create_flask_app
from .auth import authenticate_user
from .environ import extract_environment_variable
from .exceptions import AuthError
from .routes import (
    register_login_route,
    register_react_base,
    register_user_logout,
    register_user_validation,
)
from .settings import (
    ALLOWED_CORS_ORIGINS,
    ALLOWED_FIELDS,
    DEBUG,
    STATIC_FOLDER,
    TEMPLATE_FOLDER,
)
