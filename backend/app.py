"""
GTM Repository Backend API
Flask-based backend for serving GTM resources
"""

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from blob_service import BlobStorageService
from gtm_data import GTM_RESOURCES

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Blob Storage Service
blob_service = BlobStorageService()


def serialize_resource(resource):
    """Normalize resource payload and resolve the final video URL."""
    raw_video_value = resource.get('video_blob_name') or resource.get('video_url', '')
    return {
        'id': resource['id'],
        'header': resource['header'],
        'description': resource['description'],
        'tags': resource['tags'],
        'video_url': blob_service.build_blob_url(raw_video_value)
    }


@app.route('/api/resources', methods=['GET'])
def get_resources():
    """
    Get all GTM resources
    
    Returns:
        JSON: List of all resources with header, description, tags, and video URL
    """
    try:
        resources = [serialize_resource(resource) for resource in GTM_RESOURCES]
        
        return jsonify(resources), 200
    except Exception as e:
        print(f"Error fetching resources: {str(e)}")
        return jsonify({'error': 'Failed to fetch resources'}), 500


@app.route('/api/resources/<int:resource_id>', methods=['GET'])
def get_resource(resource_id):
    """
    Get a specific resource by ID
    
    Args:
        resource_id (int): The resource ID
    
    Returns:
        JSON: Resource details
    """
    try:
        resource = next((r for r in GTM_RESOURCES if r['id'] == resource_id), None)
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404

        resource_data = serialize_resource(resource)

        return jsonify(resource_data), 200
    except Exception as e:
        print(f"Error fetching resource {resource_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch resource'}), 500


@app.route('/api/tags', methods=['GET'])
def get_tags():
    """
    Get all unique tags across resources
    
    Returns:
        JSON: List of unique tags
    """
    try:
        tags = set()
        for resource in GTM_RESOURCES:
            tags.update(resource['tags'])
        
        return jsonify(sorted(list(tags))), 200
    except Exception as e:
        print(f"Error fetching tags: {str(e)}")
        return jsonify({'error': 'Failed to fetch tags'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns:
        JSON: Health status
    """
    return jsonify({'status': 'healthy', 'service': 'GTM Repository API'}), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=debug_mode
    )
