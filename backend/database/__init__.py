from .config import Config
from .db import db
from .models import Project


def initialize_database(app):
    update_configuration(app)
    db.init_app(app)


def update_configuration(app):
    app.config.from_object(Config)
