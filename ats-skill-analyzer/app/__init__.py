from flask import Flask
import sys
from pathlib import Path

# Add parent directory to Python path to allow 'app' module imports
parent_dir = Path(__file__).parent.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from app.resources_api import resources_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(resources_bp)
    return app
