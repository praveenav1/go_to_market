import os
import json
from datetime import datetime
from db import create_team, get_user_by_username

ROOT = os.path.dirname(__file__)
TEAM_REQUESTS_FILE = os.path.join(ROOT, 'team_requests.json')


def _load():
    if not os.path.exists(TEAM_REQUESTS_FILE):
        return []
    try:
        with open(TEAM_REQUESTS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []


def _save(data):
    with open(TEAM_REQUESTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


class TeamRequestManager:
    @staticmethod
    def add_request(team_name, requester, approver_username, members):
        requests = _load()
        req_id = max([r.get('id', 0) for r in requests], default=0) + 1
        req = {
            'id': req_id,
            'team_name': team_name,
            'requester': requester,
            'approver': approver_username,
            'members': [{'username': m.get('username')} for m in members],
            'member_credentials': members,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'reviewed_at': None,
            'review_notes': ''
        }
        requests.append(req)
        _save(requests)
        return req

    @staticmethod
    def get_requests(status=None, approver=None):
        reqs = _load()
        if status and approver:
            return [r for r in reqs if r.get('status') == status and r.get('approver') == approver]
        if status:
            return [r for r in reqs if r.get('status') == status]
        if approver:
            return [r for r in reqs if r.get('approver') == approver]
        return reqs

    @staticmethod
    def get_request(request_id):
        reqs = _load()
        return next((r for r in reqs if r.get('id') == request_id), None)

    @staticmethod
    def approve_request(request_id, review_notes=''):
        reqs = _load()
        req = next((r for r in reqs if r.get('id') == request_id), None)
        if not req:
            return False
        # create team and users
        members = req.get('member_credentials', [])
        approver = req.get('approver')
        # Map approver username to id if exists (we store usernames in roles/users JSON)
        success = create_team(req.get('team_name'), approver_ids=None, member_credentials=members)
        if not success:
            return False
        req['status'] = 'approved'
        req['review_notes'] = review_notes
        req['reviewed_at'] = datetime.now().isoformat()
        _save(reqs)
        return True

    @staticmethod
    def reject_request(request_id, review_notes=''):
        reqs = _load()
        req = next((r for r in reqs if r.get('id') == request_id), None)
        if not req:
            return False
        req['status'] = 'rejected'
        req['review_notes'] = review_notes
        req['reviewed_at'] = datetime.now().isoformat()
        _save(reqs)
        return True
