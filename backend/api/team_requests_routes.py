from flask import Blueprint, jsonify, request, current_app
from ..db import get_user_by_username, create_team
from ..team_requests import TeamRequestManager
import pymysql
from pymysql.cursors import DictCursor
import os

team_requests_bp = Blueprint('team_requests', __name__)


@team_requests_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing credentials'}), 400

        user = get_user_by_username(username)
        if user:
            from hashlib import sha256
            if user.get('password_hash') == sha256(password.encode('utf-8')).hexdigest():
                return jsonify({'user': {'id': user.get('id'), 'username': user.get('username'), 'teams': user.get('teams', [])}}), 200

        # Try MySQL fallback
        def env_or(name, default):
            v = os.getenv(name)
            return v if v else default

        conn = pymysql.connect(
            host=env_or('MYSQL_HOST', 'localhost'),
            user=env_or('MYSQL_USER', 'root'),
            password=env_or('MYSQL_PASSWORD', 'root'),
            database=env_or('MYSQL_DATABASE', 'ai_experience_hub'),
            cursorclass=DictCursor,
            connect_timeout=5
        )
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT UserId, UserName, Password FROM users WHERE UserName = %s", (username,))
                row = cursor.fetchone()
                if not row:
                    return jsonify({'error': 'Invalid credentials'}), 401
                if str(row.get('Password')) != str(password):
                    return jsonify({'error': 'Invalid credentials'}), 401
                cursor.execute(
                    "SELECT t.TeamName FROM TeamApprovers ta JOIN teams t ON ta.TeamId = t.TeamId WHERE ta.UserId = %s",
                    (row.get('UserId'),)
                )
                teams_rows = cursor.fetchall()
                teams = [r['TeamName'] for r in teams_rows if r.get('TeamName')]
                return jsonify({'user': {'id': row.get('UserId'), 'username': row.get('UserName'), 'teams': teams}}), 200
        finally:
            try:
                conn.close()
            except Exception:
                pass
    except Exception as e:
        print(f"Error in admin login: {e}")
        return jsonify({'error': 'Login failed'}), 500


@team_requests_bp.route('/api/team_requests', methods=['POST'])
def create_team_request():
    try:
        data = request.get_json() or {}
        team_name = data.get('team_name')
        requester = data.get('requester')
        approver = data.get('approver')
        members = data.get('members', [])
        if not team_name or not requester or not approver or not members:
            return jsonify({'error': 'Missing required fields'}), 400
        req = TeamRequestManager.add_request(team_name, requester, approver, members)
        return jsonify(req), 201
    except Exception as e:
        print(f"Error creating team request: {e}")
        return jsonify({'error': 'Failed to create request'}), 500


@team_requests_bp.route('/api/team_requests', methods=['GET'])
def list_team_requests():
    try:
        status = request.args.get('status')
        approver = request.args.get('approver')
        reqs = TeamRequestManager.get_requests(status=status, approver=approver)
        return jsonify(reqs), 200
    except Exception as e:
        print(f"Error listing team requests: {e}")
        return jsonify({'error': 'Failed to list requests'}), 500


@team_requests_bp.route('/api/team_requests/<int:request_id>/approve', methods=['POST'])
def approve_team_request(request_id):
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        ok = TeamRequestManager.approve_request(request_id, review_notes)
        if not ok:
            return jsonify({'error': 'Request not found or failed'}), 404
        return jsonify({'message': 'Team request approved'}), 200
    except Exception as e:
        print(f"Error approving team request: {e}")
        return jsonify({'error': 'Failed to approve request'}), 500


@team_requests_bp.route('/api/team_requests/<int:request_id>/reject', methods=['POST'])
def reject_team_request(request_id):
    try:
        data = request.get_json() or {}
        review_notes = data.get('review_notes', '')
        ok = TeamRequestManager.reject_request(request_id, review_notes)
        if not ok:
            return jsonify({'error': 'Request not found'}), 404
        return jsonify({'message': 'Team request rejected'}), 200
    except Exception as e:
        print(f"Error rejecting team request: {e}")
        return jsonify({'error': 'Failed to reject request'}), 500
