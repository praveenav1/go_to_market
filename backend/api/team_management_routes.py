from flask import Blueprint, jsonify, request
from db import get_all_teams_with_members, update_team_name, delete_team, delete_team_member, update_team_member

team_management_bp = Blueprint('team_management', __name__)


@team_management_bp.route('/api/teams', methods=['GET'])
def get_teams():
    try:
        teams = get_all_teams_with_members()
        return jsonify(teams), 200
    except Exception as e:
        print(f"Error fetching teams: {e}")
        return jsonify({'error': 'Failed to fetch teams'}), 500


@team_management_bp.route('/api/teams/<team_name>', methods=['PUT'])
def update_team(team_name):
    try:
        data = request.get_json() or {}
        new_team_name = data.get('new_team_name')
        
        if not new_team_name:
            return jsonify({'error': 'new_team_name is required'}), 400
        
        success = update_team_name(team_name, new_team_name)
        if not success:
            return jsonify({'error': 'Team not found or name already exists'}), 404
        
        return jsonify({'message': 'Team updated', 'old_name': team_name, 'new_name': new_team_name}), 200
    except Exception as e:
        print(f"Error updating team: {e}")
        return jsonify({'error': 'Failed to update team'}), 500


@team_management_bp.route('/api/teams/<team_name>', methods=['DELETE'])
def delete_team_route(team_name):
    try:
        success = delete_team(team_name)
        if not success:
            return jsonify({'error': 'Team not found'}), 404
        
        return jsonify({'message': 'Team deleted', 'team_name': team_name}), 200
    except Exception as e:
        print(f"Error deleting team: {e}")
        return jsonify({'error': 'Failed to delete team'}), 500


@team_management_bp.route('/api/team-members/<username>', methods=['DELETE'])
def delete_team_member_route(username):
    try:
        delete_team_member(username)
        return jsonify({'message': 'Team member deleted', 'username': username}), 200
    except Exception as e:
        print(f"Error deleting team member: {e}")
        return jsonify({'error': 'Failed to delete team member'}), 500


@team_management_bp.route('/api/team-members/<username>', methods=['PUT'])
def update_team_member_route(username):
    try:
        data = request.get_json() or {}
        new_username = data.get('new_username')
        
        if not new_username:
            return jsonify({'error': 'new_username is required'}), 400
        
        success = update_team_member(username, new_username)
        if not success:
            return jsonify({'error': 'Member not found or new username already exists'}), 404
        
        return jsonify({'message': 'Team member updated', 'old_username': username, 'new_username': new_username}), 200
    except Exception as e:
        print(f"Error updating team member: {e}")
        return jsonify({'error': 'Failed to update team member'}), 500
