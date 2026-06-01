"""
GTM Repository Backend API
Flask-based backend for serving GTM resources
"""

import json
from flask import Flask, jsonify, request, send_file, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename
from blob_service import BlobStorageService
from submissions import SubmissionsManager
# from gtm_data import GTM_RESOURCES

# Load team roles from roles.json
ROLES_FILE = os.path.join(os.path.dirname(__file__), 'roles.json')

def load_roles():
    if not os.path.exists(ROLES_FILE):
        return {'teams': []}
    try:
        with open(ROLES_FILE, 'r') as f:
            roles = json.load(f)
            return roles if isinstance(roles, dict) else {'teams': []}
    except Exception as e:
        print(f"Error loading roles file: {str(e)}")
        return {'teams': []}

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)
blob_service = BlobStorageService()

# Configure file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp_uploads')
UPLOADS_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')  # Persistent uploads
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'm4v'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(UPLOADS_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOADS_FOLDER'] = UPLOADS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize Blob Storage Service



def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def serialize_resource(resource):
    """Normalize resource payload and resolve the final video URL."""
    raw_video_value = resource.get('video_blob_name') or resource.get('video_url', '')
    return {
        'id': resource['id'],
        'header': resource['header'],
        'description': resource['description'],
        'tags': resource.get('tags', []),
        'video_url': blob_service.build_blob_url(raw_video_value),
        'contact': resource.get('contact'),
        'team': resource.get('team'),
        'approver': resource.get('approver')
    }


@app.route('/api/resources', methods=['GET'])
def get_resources():
    """
    Get all GTM resources
    
    Returns:
        JSON: List of all resources with header, description, tags, and video URL
    """
    
    try:
        azure_resources = blob_service.download_json_blob("resources.json")

        if not isinstance(azure_resources, list):
            azure_resources = []

        resources = [serialize_resource(r) for r in azure_resources]

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
        azure_resources = blob_service.download_json_blob("resources.json")

        if not isinstance(azure_resources, list):
            azure_resources = []

        resource = next((r for r in azure_resources if r['id'] == resource_id), None)

        if not resource:
            return jsonify({'error': 'Resource not found'}), 404

        return jsonify(serialize_resource(resource)), 200

    except Exception as e:
        print(f"Error fetching resource {resource_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch resource'}), 500



@app.route('/api/tags', methods=['GET'])
def get_tags():
   
    try:
        azure_resources = blob_service.download_json_blob("resources.json")

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
        print(f"Error fetching tags: {str(e)}")
        return jsonify({'error': 'Failed to fetch tags'}), 500


@app.route('/api/roles', methods=['GET'])
def get_roles():
    """
    Get configured teams and approvers.
    """
    try:
        roles = load_roles()
        return jsonify(roles), 200
    except Exception as e:
        print(f"Error fetching roles: {str(e)}")
        return jsonify({'error': 'Failed to fetch roles'}), 500



@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns:
        JSON: Health status
    """
    return jsonify({'status': 'healthy', 'service': 'GTM Repository API'}), 200


@app.route('/api/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """
    Serve uploaded video files via Azure Blob Storage or local fallback
    
    Args:
        filename (str): Name of the file to serve
    
    Returns:
        Redirect to Azure blob URL, local file stream, or 404
    """
    try:
        blob_url = blob_service.build_blob_url(filename)
        if blob_url.startswith('http'):
            return redirect(blob_url)

        file_path = os.path.join(app.config['UPLOADS_FOLDER'], secure_filename(filename))
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, mimetype='video/mp4')
    except Exception as e:
        print(f"Error serving upload {filename}: {str(e)}")
        return jsonify({'error': 'Failed to serve file'}), 500


@app.route('/api/debug/status', methods=['GET'])
def debug_status():
    """
    Debug endpoint to check backend configuration status
    
    Returns:
        JSON: Status of various backend services
    """
    return jsonify({
        'status': 'healthy',
        'azure_blob_configured': blob_service.client is not None,
        'connection_string_set': bool(os.getenv('AZURE_STORAGE_CONNECTION_STRING')),
        'container_url_set': bool(os.getenv('AZURE_BLOB_CONTAINER_URL')),
        'upload_folder': app.config['UPLOAD_FOLDER'],
        'upload_folder_exists': os.path.exists(app.config['UPLOAD_FOLDER']),
        'max_file_size_mb': MAX_FILE_SIZE / (1024 * 1024)
    }), 200


# ============== SUBMISSION ENDPOINTS ==============

@app.route('/api/submissions', methods=['POST'])
def submit_gtm_resource():
    """
    Submit a new GTM resource for admin approval
    
    Expects:
        - header (str): Resource title
        - description (str): Resource description
        - tags (str): JSON string of tags
        - video (file): Video file
    
    Returns:
        JSON: Submission confirmation with ID
    """
    try:
        # Validate request
        if 'video' not in request.files:
            print("DEBUG: No video file in request")
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            print("DEBUG: Empty filename")
            return jsonify({'error': 'No video file selected'}), 400
        
        if not allowed_file(file.filename):
            print(f"DEBUG: Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type. Allowed: MP4, WebM, AVI, MOV, MKV, FLV, M4V'}), 400
        
        # Get form data
        header = request.form.get('header', '').strip()
        description = request.form.get('description', '').strip()
        tags_json = request.form.get('tags', '[]')
        team = request.form.get('team', '').strip()
        approver = request.form.get('approver', '').strip()

        roles_data = load_roles()
        teams = [t.get('name') for t in roles_data.get('teams', []) if t.get('name')]
        matching_team = next((t for t in roles_data.get('teams', []) if t.get('name') == team), None)
        
        print(f"DEBUG: Received header={header}, description={description[:50]}..., tags_json={tags_json}")
        
        # Validate form data
        if not header:
            print("DEBUG: Empty header")
            return jsonify({'error': 'Header is required'}), 400
        if not description:
            print("DEBUG: Empty description")
            return jsonify({'error': 'Description is required'}), 400
        if not team:
            print("DEBUG: Empty team")
            return jsonify({'error': 'Team is required'}), 400
        if team and team not in teams:
            print(f"DEBUG: Invalid team selected: {team}")
            return jsonify({'error': 'Selected team is not valid'}), 400
        if not approver:
            print("DEBUG: Empty approver")
            return jsonify({'error': 'Approver is required'}), 400
        if matching_team and approver not in matching_team.get('approvers', []):
            print(f"DEBUG: Invalid approver {approver} for team {team}")
            return jsonify({'error': 'Selected approver is not valid for the chosen team'}), 400
        
        try:
            tags = json.loads(tags_json) if isinstance(tags_json, str) else tags_json
            if not tags or len(tags) == 0:
                print("DEBUG: No tags provided")
                return jsonify({'error': 'At least one tag is required'}), 400
        except (json.JSONDecodeError, TypeError) as e:
            print(f"DEBUG: Tags JSON parse error: {str(e)}")
            return jsonify({'error': 'Invalid tags format'}), 400

        if team and team not in tags:
            tags.append(team)
        
        # Upload video directly to Azure Blob Storage (no temp file)
        filename = secure_filename(file.filename)
        blob_name = None
        try:
            print("DEBUG: Attempting to upload video to Azure Blob Storage")
            blob_name = blob_service.upload_blob_stream(file, filename)
            
            if not blob_name:
                print("DEBUG: blob_name is None after upload attempt")
                raise Exception("Failed to upload blob")
            
            print(f"DEBUG: blob_name={blob_name}")
            
        except Exception as e:
            print(f"DEBUG: Error uploading video: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to upload video to Azure: {str(e)}'}), 500
        
        # Contact (optional)
        contact = request.form.get('contact', '').strip()

        # Save submission to database
        print(f"DEBUG: Saving submission with blob_name={blob_name} contact={contact}")
        submission = SubmissionsManager.add_submission(
            header=header,
            description=description,
            tags=tags,
            video_blob_name=blob_name,
            contact=contact,
            team=team,
            approver=approver
        )
        
        if not submission:
            print("DEBUG: Failed to create submission")
            return jsonify({'error': 'Failed to save submission'}), 500
        
        print(f"DEBUG: Submission created with ID {submission['id']}")
        return jsonify({
            'message': 'GTM resource submitted successfully for approval',
            'submission_id': submission['id'],
            'status': submission['status']
        }), 201
    
    except Exception as e:
        print(f"ERROR: Unhandled exception in submit_gtm_resource: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to submit GTM resource: {str(e)}'}), 500


@app.route('/api/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    """
    Get a specific submission by ID

    Args:
        submission_id (int): Submission ID

    Returns:
        JSON: Submission details
    """
    try:
        submission = SubmissionsManager.get_submission(submission_id)
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        return jsonify(submission), 200
    except Exception as e:
        print(f"Error fetching submission {submission_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch submission'}), 500


@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    """
    Get all submissions (admin only)
    Query params:
        - status: Filter by status (pending, approved, rejected)
    
    Returns:
        JSON: List of submissions
    """
    try:
        status = request.args.get('status')
        team = request.args.get('team')
        submissions = SubmissionsManager.get_submissions(status=status, team=team)
        return jsonify(submissions), 200
    except Exception as e:
        print(f"Error fetching submissions: {str(e)}")
        return jsonify({'error': 'Failed to fetch submissions'}), 500

print("✅ THIS FILE IS RUNNING")
@app.route('/api/submissions/<int:submission_id>/approve', methods=['POST'])
def approve_submission(submission_id):
    print("✅ HIT APPROVE API", submission_id)
    """
    Approve a submission (admin only)
    
    Args:
        submission_id (int): Submission ID
    
    Returns:
        JSON: Approval confirmation
    """
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        
        success = SubmissionsManager.approve_submission(submission_id, review_notes)
        
        if not success:
            return jsonify({'error': 'Submission not found'}), 404
        
        return jsonify({
            'message': 'Submission approved successfully',
            'submission_id': submission_id,
            'status': 'approved'
        }), 200
    except Exception as e:
        print(f"Error approving submission {submission_id}: {str(e)}")
        return jsonify({'error': 'Failed to approve submission'}), 500


@app.route('/api/submissions/<int:submission_id>/reject', methods=['POST'])
def reject_submission(submission_id):
    """
    Reject a submission (admin only)
    
    Args:
        submission_id (int): Submission ID
    
    Returns:
        JSON: Rejection confirmation
    """
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        
        success = SubmissionsManager.reject_submission(submission_id, review_notes)
        
        if not success:
            return jsonify({'error': 'Submission not found'}), 404
        
        return jsonify({
            'message': 'Submission rejected',
            'submission_id': submission_id,
            'status': 'rejected'
        }), 200
    except Exception as e:
        print(f"Error rejecting submission {submission_id}: {str(e)}")
        return jsonify({'error': 'Failed to reject submission'}), 500


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
    # Print registered routes for debugging
    try:
        print("Registered Flask routes:")
        for rule in app.url_map.iter_rules():
            print(f"{rule} -> {rule.endpoint}")
    except Exception as _:
        pass

    app.run(
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=debug_mode
    )
