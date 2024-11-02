"""
This module provides the function to create and configure a Flask application instance.
"""

from flask import Flask

from .environ import extract_environment_variable


def create_flask_app(name, *args, **kwargs):
    """
    Create and configure a Flask application instance.

    Args:
        name (str): The name of the Flask application.
        *args: Additional positional arguments for the Flask application.
        **kwargs: Additional keyword arguments for the Flask application.

    Returns:
        Flask: A configured Flask application instance.
    """
    app = Flask(name, *args, **kwargs)
    app.config["SECRET_KEY"] = extract_environment_variable("SECRET_KEY")
    return app
