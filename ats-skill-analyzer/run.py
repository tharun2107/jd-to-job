#!/usr/bin/env python
"""
Entry point script for the ATS Skill Analyzer Flask application.
Run this from the ats-skill-analyzer directory.
"""
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# Now import and run the app
from app.main import app

if __name__ == '__main__':
    print("🚀 Starting ATS Skill Analyzer Flask Server...")
    print("📡 Server will be available at http://localhost:5000")
    print("📝 API endpoint: http://localhost:5000/analyze")
    print("🔧 Running in debug mode")
    app.run(debug=True, host='0.0.0.0', port=5000)

