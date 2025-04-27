# squat_routes.py

from flask import Blueprint, render_template_string
import os
import sys

# Allow importing from parent directories
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

# Import your existing modules
from Live_Stream import run_live_squat
from Upload_Video import run_upload_squat

# Create a Blueprint
squat_bp = Blueprint('squat_bp', __name__)

# Squat Live Route
@squat_bp.route('/squat/live')
def squat_live():
    # Call the live squat trainer
    return run_live_squat()

# Squat Upload Route
@squat_bp.route('/squat/upload')
def squat_upload():
    # Call the upload squat trainer
    return run_upload_squat()
