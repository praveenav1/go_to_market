from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from ..blob_service import BlobStorageService


def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)

    # Configure upload folders and limits
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'temp_uploads')
    UPLOADS_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    app.config['UPLOAD_FOLDER'] = os.path.abspath(UPLOAD_FOLDER)
    app.config['UPLOADS_FOLDER'] = os.path.abspath(UPLOADS_FOLDER)
    app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024

    # Attach blob service to app for route modules to use
    app.blob_service = BlobStorageService()

    # Register blueprints
    from .resources import resources_bp
    from .submissions_routes import submissions_bp
    from .team_requests_routes import team_requests_bp

    app.register_blueprint(resources_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(team_requests_bp)

    return app
