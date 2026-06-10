from flask import Blueprint, jsonify, request, current_app
from ..submissions import SubmissionsManager
import json

submissions_bp = Blueprint('submissions', __name__)


@submissions_bp.route('/api/submissions', methods=['POST'])
def submit_gtm_resource():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400

        # Use logic from previous implementation: minimal validation
        header = request.form.get('header', '').strip()
        description = request.form.get('description', '').strip()
        tags_json = request.form.get('tags', '[]')
        team = request.form.get('team', '').strip()
        approver = request.form.get('approver', '').strip()

        try:
            tags = json.loads(tags_json) if isinstance(tags_json, str) else tags_json
        except Exception:
            return jsonify({'error': 'Invalid tags format'}), 400

        # Upload video
        filename = file.filename
        try:
            blob_name = current_app.blob_service.upload_blob_stream(file, filename)
        except Exception as e:
            print(f"Error uploading video: {e}")
            return jsonify({'error': 'Failed to upload video'}), 500

        contact = request.form.get('contact', '').strip()
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
            return jsonify({'error': 'Failed to save submission'}), 500
        return jsonify({'message': 'GTM resource submitted successfully for approval', 'submission_id': submission['id'], 'status': submission['status']}), 201
    except Exception as e:
        print(f"Error in submit_gtm_resource: {e}")
        return jsonify({'error': 'Failed to submit GTM resource'}), 500


@submissions_bp.route('/api/submissions', methods=['GET'])
def get_submissions():
    try:
        status = request.args.get('status')
        team = request.args.get('team')
        approver = request.args.get('approver')
        submissions = SubmissionsManager.get_submissions(status=status, team=team, approver=approver)
        return jsonify(submissions), 200
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        return jsonify({'error': 'Failed to fetch submissions'}), 500


@submissions_bp.route('/api/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    try:
        submission = SubmissionsManager.get_submission(submission_id)
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        return jsonify(submission), 200
    except Exception as e:
        print(f"Error fetching submission: {e}")
        return jsonify({'error': 'Failed to fetch submission'}), 500


@submissions_bp.route('/api/submissions/<int:submission_id>/approve', methods=['POST'])
def approve_submission(submission_id):
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        success = SubmissionsManager.approve_submission(submission_id, review_notes)
        if not success:
            return jsonify({'error': 'Submission not found'}), 404
        return jsonify({'message': 'Submission approved successfully', 'submission_id': submission_id, 'status': 'approved'}), 200
    except Exception as e:
        print(f"Error approving submission: {e}")
        return jsonify({'error': 'Failed to approve submission'}), 500


@submissions_bp.route('/api/submissions/<int:submission_id>/reject', methods=['POST'])
def reject_submission(submission_id):
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        success = SubmissionsManager.reject_submission(submission_id, review_notes)
        if not success:
            return jsonify({'error': 'Submission not found'}), 404
        return jsonify({'message': 'Submission rejected', 'submission_id': submission_id, 'status': 'rejected'}), 200
    except Exception as e:
        print(f"Error rejecting submission: {e}")
        return jsonify({'error': 'Failed to reject submission'}), 500
