"""
Main module for initializing and running the Flask application.
"""

from datetime import timedelta

from flask_cors import CORS

from backend import (
    ALLOWED_CORS_ORIGINS,
    DEBUG,
    STATIC_FOLDER,
    TEMPLATE_FOLDER,
    create_db_tables,
    create_flask_app,
    extract_environment_variable,
    initialize_database,
    register_login_route,
    register_project_model_routes,
    register_react_base,
    register_registration_route,
    register_user_logout,
    register_user_validation,
    register_video_processing,
    safe_create_results_folder,
    safe_create_upload_folder,
)

app = create_flask_app(
    __name__, template_folder=TEMPLATE_FOLDER, static_folder=STATIC_FOLDER
)
app.config.update(
    {
        "PERMANENT_SESSION_LIFETIME": timedelta(hours=1),  # Session expiration time
        "SESSION_COOKIE_SAMESITE": "Lax",
        "SESSION_COOKIE_SECURE": True,  # Requires HTTPS
        "UPLOAD_FOLDER": extract_environment_variable("UPLOAD_FOLDER"),
        "RESULT_FOLDER": extract_environment_variable("RESULT_FOLDER"),
    }
)

register_react_base(app)
register_login_route(app)
register_registration_route(app)
register_user_validation(app)
register_user_logout(app)
register_project_model_routes(app)
register_video_processing(app)
safe_create_upload_folder(app)
safe_create_results_folder(app)
initialize_database(app)
create_db_tables(app)

if __name__ == "__main__":
    if DEBUG:
        CORS(app, supports_credentials=True, origins=ALLOWED_CORS_ORIGINS)
    app.run(debug=DEBUG)
