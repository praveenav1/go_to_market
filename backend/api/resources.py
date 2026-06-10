from flask import Blueprint, jsonify, request, send_file, redirect, current_app
import os
from werkzeug.utils import secure_filename
import json

resources_bp = Blueprint('resources', __name__)

ROLES_FILE = os.path.join(os.path.dirname(__file__), '..', 'roles.json')


def load_roles():
    if not os.path.exists(ROLES_FILE):
        return {'teams': []}
    try:
        with open(ROLES_FILE, 'r') as f:
            roles = json.load(f)
            return roles if isinstance(roles, dict) else {'teams': []}
    except Exception:
        return {'teams': []}


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'm4v'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def serialize_resource(resource):
    raw_video_value = resource.get('video_blob_name') or resource.get('video_url', '')
    return {
        'id': resource['id'],
        'header': resource['header'],
        'description': resource['description'],
        'tags': resource.get('tags', []),
        'video_url': current_app.blob_service.build_blob_url(raw_video_value),
        'contact': resource.get('contact'),
        'team': resource.get('team'),
        'approver': resource.get('approver')
    }


@resources_bp.route('/api/resources', methods=['GET'])
def get_resources():
    try:
        azure_resources = current_app.blob_service.download_json_blob('resources.json')
        if not isinstance(azure_resources, list):
            azure_resources = []
        resources = [serialize_resource(r) for r in azure_resources]
        return jsonify(resources), 200
    except Exception as e:
        print(f"Error fetching resources: {e}")
        return jsonify({'error': 'Failed to fetch resources'}), 500


@resources_bp.route('/api/resources/<int:resource_id>', methods=['GET'])
def get_resource(resource_id):
    try:
        azure_resources = current_app.blob_service.download_json_blob('resources.json')
        if not isinstance(azure_resources, list):
            azure_resources = []
        resource = next((r for r in azure_resources if r['id'] == resource_id), None)
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        return jsonify(serialize_resource(resource)), 200
    except Exception as e:
        print(f"Error fetching resource {resource_id}: {e}")
        return jsonify({'error': 'Failed to fetch resource'}), 500


@resources_bp.route('/api/tags', methods=['GET'])
def get_tags():
    try:
        azure_resources = current_app.blob_service.download_json_blob('resources.json')
        if not isinstance(azure_resources, list):
            azure_resources = []
        tags = set()
        for resource in azure_resources:
            tags.update(resource.get('tags', []))
        roles = load_roles()
        for team in roles.get('teams', []):
            if team.get('name'):
                tags.add(team['name'])
        return jsonify(sorted(list(tags))), 200
    except Exception as e:
        print(f"Error fetching tags: {e}")
        return jsonify({'error': 'Failed to fetch tags'}), 500


@resources_bp.route('/api/roles', methods=['GET'])
def get_roles():
    try:
        roles = load_roles()
        return jsonify(roles), 200
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return jsonify({'error': 'Failed to fetch roles'}), 500


@resources_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'GTM Repository API'}), 200


@resources_bp.route('/api/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    try:
        blob_url = current_app.blob_service.build_blob_url(filename)
        if blob_url.startswith('http'):
            return redirect(blob_url)
        file_path = os.path.join(current_app.config['UPLOADS_FOLDER'], secure_filename(filename))
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        return send_file(file_path, mimetype='video/mp4')
    except Exception as e:
        print(f"Error serving upload {filename}: {e}")
        return jsonify({'error': 'Failed to serve file'}), 500


@resources_bp.route('/api/debug/status', methods=['GET'])
def debug_status():
    return jsonify({
        'status': 'healthy',
        'azure_blob_configured': getattr(current_app.blob_service, 'client', None) is not None,
        'connection_string_set': bool(os.getenv('AZURE_STORAGE_CONNECTION_STRING')),
        'container_url_set': bool(os.getenv('AZURE_BLOB_CONTAINER_URL')),
        'upload_folder': current_app.config.get('UPLOAD_FOLDER'),
        'upload_folder_exists': os.path.exists(current_app.config.get('UPLOAD_FOLDER', '')),
        'max_file_size_mb': current_app.config.get('MAX_CONTENT_LENGTH', 0) / (1024 * 1024)
    }), 200
