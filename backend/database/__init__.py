from .config import Config
from .db import db
from .models import Project


def initialize_database(app):
    update_configuration(app)
    db.init_app(app)


def update_configuration(app):
    app.config.from_object(Config)


def create_db_tables(app):
    with app.app_context():
        db.create_all()


def add_to_db_session(object):
    db.session.add(object)
    db.session.commit()
