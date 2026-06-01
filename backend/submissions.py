"""
GTM Submissions Management
Handles user submissions for GTM resources pending admin approval
"""

import json
import os
from datetime import datetime
from blob_service import BlobStorageService  # ✅ ADD THIS

# Path to store submissions
SUBMISSIONS_FILE = os.path.join(os.path.dirname(__file__), 'submissions.json')


class SubmissionsManager:
    """Manager for handling GTM resource submissions"""

    blob_service = BlobStorageService()
    SUBMISSIONS_BLOB = 'submissions.json'

    @staticmethod
    def _load_submissions():
        # Try Azure-backed submissions first
        if SubmissionsManager.blob_service.client or SubmissionsManager.blob_service.container_url:
            try:
                submissions = SubmissionsManager.blob_service.download_json_blob(
                    SubmissionsManager.SUBMISSIONS_BLOB
                )
                if isinstance(submissions, list):
                    return submissions
            except Exception as e:
                print(f"Error loading submissions from Azure: {str(e)}")

        # Fall back to local submissions.json
        if not os.path.exists(SUBMISSIONS_FILE):
            return []

        try:
            with open(SUBMISSIONS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading submissions: {str(e)}")
            return []

    @staticmethod
    def _save_submissions(submissions):
        # Try saving to Azure blob storage
        if SubmissionsManager.blob_service.client or SubmissionsManager.blob_service.container_url:
            try:
                success = SubmissionsManager.blob_service.upload_json_blob(
                    SubmissionsManager.SUBMISSIONS_BLOB,
                    submissions
                )
                if success:
                    return True
                print("Error saving submissions to Azure blob storage")
            except Exception as e:
                print(f"Error saving submissions to Azure: {str(e)}")

        # Fall back to local submissions.json if Azure storage is unavailable
        try:
            with open(SUBMISSIONS_FILE, 'w') as f:
                json.dump(submissions, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving submissions: {str(e)}")
            return False

    # ✅ CREATE SUBMISSION (UNCHANGED)
    @staticmethod
    def add_submission(header, description, tags, video_blob_name, contact=None, team=None, approver=None):
        submissions = SubmissionsManager._load_submissions()

        submission_id = max([s.get('id', 0) for s in submissions], default=0) + 1

        submission = {
            'id': submission_id,
            'header': header,
            'description': description,
            'tags': tags,
            'video_blob_name': video_blob_name,
            'contact': contact,
            'team': team,
            'approver': approver,
            'status': 'pending',
            'submitted_at': datetime.now().isoformat(),
            'reviewed_at': None,
            'review_notes': ''
        }

        submissions.append(submission)

        if SubmissionsManager._save_submissions(submissions):
            return submission
        return None

    # ✅ GET METHODS (UNCHANGED)
    @staticmethod
    def get_submissions(status=None, team=None):
        submissions = SubmissionsManager._load_submissions()
        if status and team:
            return [s for s in submissions if s.get('status') == status and s.get('team') == team]
        if status:
            return [s for s in submissions if s.get('status') == status]
        if team:
            return [s for s in submissions if s.get('team') == team]
        return submissions

    @staticmethod
    def get_submission(submission_id):
        submissions = SubmissionsManager._load_submissions()
        return next((s for s in submissions if s['id'] == submission_id), None)

    # ✅ ✅ IMPORTANT: UPDATED APPROVE LOGIC
    @staticmethod
    def approve_submission(submission_id, review_notes=''):
        submissions = SubmissionsManager._load_submissions()

        submission = next((s for s in submissions if s['id'] == submission_id), None)
        if not submission:
            return False

        # ✅ Update submission status
        submission['status'] = 'approved'
        submission['reviewed_at'] = datetime.now().isoformat()
        submission['review_notes'] = review_notes

        SubmissionsManager._save_submissions(submissions)

        # ✅ ====== AZURE STORAGE LOGIC START ======
        try:
            blob_service = BlobStorageService()

            resources_file = "resources.json"

            # ✅ Fetch existing resources from Azure
            existing_resources = blob_service.download_json_blob(resources_file)

            if not isinstance(existing_resources, list):
                existing_resources = []

            # ✅ Generate new ID
            new_id = max([r.get('id', 0) for r in existing_resources], default=0) + 1

            new_resource = {
                "id": new_id,
                "header": submission['header'],
                "description": submission['description'],
                "tags": submission['tags'],
                "video_blob_name": submission['video_blob_name'],
                "contact": submission.get('contact'),
                "team": submission.get('team'),
                "approver": submission.get('approver')
            }

            existing_resources.append(new_resource)

            # ✅ Save back to Azure
            success = blob_service.upload_json_blob(resources_file, existing_resources)

            if not success:
                print("ERROR: Failed to upload resources.json to Azure")
                return False

            print(f"✅ Resource {new_id} stored in Azure successfully")

        except Exception as e:
            print(f"ERROR: Azure storage failed: {str(e)}")
            return False
        # ✅ ====== AZURE STORAGE LOGIC END ======

        return True

    # ✅ REJECT (UNCHANGED)
    @staticmethod
    def reject_submission(submission_id, review_notes=''):
        submissions = SubmissionsManager._load_submissions()

        submission = next((s for s in submissions if s['id'] == submission_id), None)

        if not submission:
            return False

        submission['status'] = 'rejected'
        submission['reviewed_at'] = datetime.now().isoformat()
        submission['review_notes'] = review_notes

        return SubmissionsManager._save_submissions(submissions)
