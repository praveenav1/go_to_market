"""
Lightweight DB helpers using JSON fallback.
Provides user and team creation utilities used by team request approval flow.
"""
import os
import json
from hashlib import sha256

ROOT = os.path.dirname(__file__)
USERS_FILE = os.path.join(ROOT, 'users.json')
ROLES_FILE = os.path.join(ROOT, 'roles.json')


def _load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except Exception:
        return default


def _save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)


def get_user_by_username(username):
    users = _load_json(USERS_FILE, [])
    return next((u for u in users if u.get('username') == username), None)


def get_users_by_ids(ids):
    users = _load_json(USERS_FILE, [])
    return [u for u in users if u.get('id') in ids]


def create_user(username, password, teams=None):
    users = _load_json(USERS_FILE, [])
    new_id = max([u.get('id', 0) for u in users], default=0) + 1
    hashed = sha256(password.encode('utf-8')).hexdigest() if password else ''
    user = {'id': new_id, 'username': username, 'password_hash': hashed, 'teams': teams or []}
    users.append(user)
    _save_json(USERS_FILE, users)
    return user


def create_team(team_name, approver_ids=None, member_credentials=None):
    # Update roles.json with new team
    roles = _load_json(ROLES_FILE, {'teams': []})
    teams = roles.get('teams', [])
    if any(t.get('name') == team_name for t in teams):
        return False
    approvers = []
    if approver_ids:
        approvers = [u.get('username') for u in get_users_by_ids(approver_ids)]

    new_team = {'name': team_name, 'approvers': approvers}
    teams.append(new_team)
    roles['teams'] = teams
    _save_json(ROLES_FILE, roles)

    # Create any specified members (store username + hashed password). Password stored as hash.
    if member_credentials:
        for m in member_credentials:
            username = m.get('username')
            password = m.get('password')
            if username and password and not get_user_by_username(username):
                create_user(username, password, teams=[team_name])

    return True

