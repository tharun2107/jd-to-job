from flask import Flask
from app.resources_api import resources_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(resources_bp)
    return app
