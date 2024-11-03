class Config:
    # Database configurations
    # Change to your actual database URI
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    # To disable event notifications for performance
    SQLALCHEMY_TRACK_MODIFICATIONS = False
