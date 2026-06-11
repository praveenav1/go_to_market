import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function AdminPanel({ onEdit, currentUser, isSuperAdmin }) {
  const [activeTab, setActiveTab] = useState('submissions'); // submissions, team-requests, or team-management
  const [submissions, setSubmissions] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedTeamRequest, setSelectedTeamRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Edit submission state
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editFormData, setEditFormData] = useState({
    header: '',
    description: '',
    tags: [],
    contact: ''
  });
  
  // Team creation form state
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    teamName: '',
    members: [{ username: '', password: '' }],
    selectedApprover: ''
  });
  
  // Team management state
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editingMemberUsername, setEditingMemberUsername] = useState('');

  // useEffect(() => {
  //   fetchTeams();
  //   if (activeTab === 'submissions') {
  //     fetchSubmissions();
  //   } else if (activeTab === 'team-requests') {
  //     fetchTeamRequests();
  //   } else if (activeTab === 'team-management') {
  //     fetchAllTeams();
  //   }
  // }, [filter, activeTab]);

  // useEffect(() => {
  //   if (activeTab === 'submissions') {
  //     fetchSubmissions();
  //   }
  // }, [selectedTeam]);
  useEffect(() => {
  fetchTeams();

  if (activeTab === 'submissions') {
    fetchSubmissions();
  } else if (activeTab === 'team-requests') {
    fetchTeamRequests();
  } else if (activeTab === 'team-management') {
    fetchAllTeams();
  }
}, [filter, activeTab, selectedTeam]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/roles`);
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const query = [];
      if (filter && filter !== 'all') query.push(`status=${filter}`);
      if (selectedTeam) query.push(`team=${encodeURIComponent(selectedTeam)}`);
      const url = `${API_BASE_URL}/api/submissions${query.length ? `?${query.join('&')}` : ''}`;
      
      const response = await axios.get(url);
      setSubmissions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRequests = async () => {
    try {
      setLoading(true);
      const query = [];
      if (filter && filter !== 'all') query.push(`status=${filter}`);
      if (currentUser?.username) query.push(`approver=${encodeURIComponent(currentUser.username)}`);
      const url = `${API_BASE_URL}/api/team_requests${query.length ? `?${query.join('&')}` : ''}`;
      
      const response = await axios.get(url);
      setTeamRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching team requests:', err);
      setError('Failed to load team requests');
      setTeamRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      setAllTeams(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
      setAllTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      setActionInProgress(true);
      await axios.post(
        `${API_BASE_URL}/api/submissions/${submissionId}/approve`,
        { review_notes: reviewNotes }
      );
      setReviewNotes('');
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Error approving submission:', err);
      setError('Failed to approve submission');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (submissionId) => {
    try {
      setActionInProgress(true);
      await axios.post(
        `${API_BASE_URL}/api/submissions/${submissionId}/reject`,
        { review_notes: reviewNotes }
      );
      setReviewNotes('');
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Error rejecting submission:', err);
      setError('Failed to reject submission');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission.id);
    setEditFormData({
      header: submission.header,
      description: submission.description,
      tags: submission.tags || [],
      contact: submission.contact || ''
    });
  };

  const handleSaveSubmissionEdit = async () => {
    try {
      setActionInProgress(true);
      await axios.put(
        `${API_BASE_URL}/api/submissions/${editingSubmission}`,
        editFormData
      );
      setEditingSubmission(null);
      setEditFormData({ header: '', description: '', tags: [], contact: '' });
      setError(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Error updating submission:', err);
      setError('Failed to update submission');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        setActionInProgress(true);
        await axios.delete(`${API_BASE_URL}/api/submissions/${submissionId}`);
        setError(null);
        fetchSubmissions();
      } catch (err) {
        console.error('Error deleting submission:', err);
        setError('Failed to delete submission');
      } finally {
        setActionInProgress(false);
      }
    }
  };

  const handleCreateTeamRequest = async (e) => {
    e.preventDefault();
    if (!teamFormData.teamName || teamFormData.members.some(m => !m.username || !m.password) || !teamFormData.selectedApprover) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setActionInProgress(true);
      await axios.post(`${API_BASE_URL}/api/team_requests`, {
        team_name: teamFormData.teamName,
        requester: currentUser?.username || 'Unknown',
        approver: teamFormData.selectedApprover,
        members: teamFormData.members
      });
      setShowCreateTeamForm(false);
      setTeamFormData({ teamName: '', members: [{ username: '', password: '' }], selectedApprover: '' });
      setError(null);
      fetchTeamRequests();
    } catch (err) {
      console.error('Error creating team request:', err);
      setError('Failed to create team request');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApproveTeamRequest = async (requestId) => {
    try {
      setActionInProgress(true);
      await axios.post(
        `${API_BASE_URL}/api/team_requests/${requestId}/approve`,
        { review_notes: reviewNotes }
      );
      setReviewNotes('');
      setSelectedTeamRequest(null);
      fetchTeamRequests();
    } catch (err) {
      console.error('Error approving team request:', err);
      setError('Failed to approve team request');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectTeamRequest = async (requestId) => {
    try {
      setActionInProgress(true);
      await axios.post(
        `${API_BASE_URL}/api/team_requests/${requestId}/reject`,
        { review_notes: reviewNotes }
      );
      setReviewNotes('');
      setSelectedTeamRequest(null);
      fetchTeamRequests();
    } catch (err) {
      console.error('Error rejecting team request:', err);
      setError('Failed to reject team request');
    } finally {
      setActionInProgress(false);
    }
  };

  const addMemberField = () => {
    setTeamFormData({
      ...teamFormData,
      members: [...teamFormData.members, { username: '', password: '' }]
    });
  };

  const removeMemberField = (index) => {
    setTeamFormData({
      ...teamFormData,
      members: teamFormData.members.filter((_, i) => i !== index)
    });
  };

  const updateMemberField = (index, field, value) => {
    const updatedMembers = [...teamFormData.members];
    updatedMembers[index][field] = value;
    setTeamFormData({ ...teamFormData, members: updatedMembers });
  };

  const handleUpdateTeam = async (oldTeamName) => {
    if (!editingTeamName || editingTeamName === oldTeamName) {
      setEditingTeam(null);
      return;
    }
    try {
      setActionInProgress(true);
      await axios.put(
        `${API_BASE_URL}/api/teams/${oldTeamName}`,
        { new_team_name: editingTeamName }
      );
      setEditingTeam(null);
      setEditingTeamName('');
      setError(null);
      fetchAllTeams();
    } catch (err) {
      console.error('Error updating team:', err);
      setError('Failed to update team name');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteTeam = async (teamName) => {
    if (window.confirm(`Are you sure you want to delete team "${teamName}" and all its members?`)) {
      try {
        setActionInProgress(true);
        await axios.delete(`${API_BASE_URL}/api/teams/${teamName}`);
        setError(null);
        fetchAllTeams();
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Failed to delete team');
      } finally {
        setActionInProgress(false);
      }
    }
  };

  const handleDeleteMember = async (username) => {
    if (window.confirm(`Are you sure you want to delete member "${username}"?`)) {
      try {
        setActionInProgress(true);
        await axios.delete(`${API_BASE_URL}/api/team-members/${username}`);
        setError(null);
        fetchAllTeams();
      } catch (err) {
        console.error('Error deleting team member:', err);
        setError('Failed to delete team member');
      } finally {
        setActionInProgress(false);
      }
    }
  };

  const handleSaveMemberUsername = async (oldUsername) => {
    if (!editingMemberUsername || editingMemberUsername === oldUsername) {
      setEditingMember(null);
      return;
    }
    try {
      setActionInProgress(true);
      await axios.put(
        `${API_BASE_URL}/api/team-members/${oldUsername}`,
        { new_username: editingMemberUsername }
      );
      setEditingMember(null);
      setEditingMemberUsername('');
      setError(null);
      fetchAllTeams();
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member username');
    } finally {
      setActionInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Panel</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 font-semibold ${activeTab === 'submissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            GTM Submissions
          </button>
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setActiveTab('team-requests')}
                className={`px-4 py-2 font-semibold ${activeTab === 'team-requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Team Requests
              </button>
              <button
                onClick={() => setActiveTab('team-management')}
                className={`px-4 py-2 font-semibold ${activeTab === 'team-management' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Team Management
              </button>
            </>
          )}
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex gap-2 flex-wrap">
                <div className="min-w-[220px]">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">All teams</option>
                    {teams.map(team => (
                      <option key={team.name} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
                {['pending', 'approved', 'rejected', 'all'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading submissions...</p>
                </div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No submissions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{submission.header}</h3>
                        <p className="text-gray-600 mt-2">{submission.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(submission.status)}`}>
                        {submission.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <p className="font-semibold">Submitted:</p>
                        <p>{formatDate(submission.submitted_at)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Reviewed:</p>
                        <p>{formatDate(submission.reviewed_at)}</p>
                      </div>
                    </div>

                    {submission.contact && (
                      <div className="mb-3 text-sm text-gray-700">
                        <p className="font-semibold">Contact Person:</p>
                        <p>{submission.contact}</p>
                      </div>
                    )}

                    {submission.tags && submission.tags.length > 0 && (
                      <div className="mb-4">
                        <p className="font-semibold text-sm text-gray-700 mb-2">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {submission.tags.map(tag => (
                            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {submission.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubmission(submission)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          disabled={actionInProgress}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSelectedSubmission(submission.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          disabled={actionInProgress}
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <h2 className="text-2xl font-bold mb-4">Review Submission</h2>

                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes (optional)"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    disabled={actionInProgress}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedSubmission)}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                    >
                      {actionInProgress ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedSubmission)}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                    >
                      {actionInProgress ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubmission(null);
                        setReviewNotes('');
                      }}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Team Requests Tab */}
        {activeTab === 'team-requests' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Team Requests</h2>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowCreateTeamForm(!showCreateTeamForm)}
                  className="px-4 py-2 bg-ey-yellow text-ey-black rounded-lg font-semibold hover:bg-yellow-400"
                >
                  {showCreateTeamForm ? 'Cancel' : '+ Create Team'}
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex gap-2 flex-wrap">
                {['pending', 'approved', 'rejected', 'all'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Creation Form */}
            {showCreateTeamForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Create New Team Request</h3>
                <form onSubmit={handleCreateTeamRequest}>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={teamFormData.teamName}
                      onChange={(e) => setTeamFormData({ ...teamFormData, teamName: e.target.value })}
                      placeholder="Enter team name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Approver</label>
                    <select
                      value={teamFormData.selectedApprover}
                      onChange={(e) => setTeamFormData({ ...teamFormData, selectedApprover: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Approver</option>
                      {teams.flatMap(team => 
                        (team.approvers || []).map(approver => (
                          <option key={`${team.name}-${approver}`} value={approver}>{approver} ({team.name})</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700">Team Members</label>
                      <button
                        type="button"
                        onClick={addMemberField}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        + Add Member
                      </button>
                    </div>
                    {teamFormData.members.map((member, idx) => (
                      <div key={idx} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Username"
                          value={member.username}
                          onChange={(e) => updateMemberField(idx, 'username', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={member.password}
                          onChange={(e) => updateMemberField(idx, 'password', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
                        />
                        {teamFormData.members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMemberField(idx)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                    >
                      {actionInProgress ? 'Submitting...' : 'Submit Team Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTeamForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Team Requests List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading team requests...</p>
                </div>
              </div>
            ) : teamRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No team requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{req.team_name}</h3>
                        <p className="text-gray-600 mt-1">Requested by: {req.requester}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(req.status)}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold text-sm text-gray-700 mb-2">Members:</p>
                      <div className="space-y-1">
                        {req.members?.map((m, idx) => (
                          <p key={idx} className="text-sm text-gray-600">• {m.username}</p>
                        ))}
                      </div>
                    </div>

                    {req.review_notes && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="font-semibold text-sm text-gray-700 mb-1">Review Notes:</p>
                        <p className="text-sm text-gray-600">{req.review_notes}</p>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <button
                        onClick={() => setSelectedTeamRequest(req.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={actionInProgress}
                      >
                        Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Team Request Review Modal */}
            {selectedTeamRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <h2 className="text-2xl font-bold mb-4">Review Team Request</h2>

                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes (optional)"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    disabled={actionInProgress}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveTeamRequest(selectedTeamRequest)}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                    >
                      {actionInProgress ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectTeamRequest(selectedTeamRequest)}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                    >
                      {actionInProgress ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeamRequest(null);
                        setReviewNotes('');
                      }}
                      disabled={actionInProgress}
                      className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Edit Submission Modal */}
        {editingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Submission</h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Header</label>
                <input
                  type="text"
                  value={editFormData.header}
                  onChange={(e) => setEditFormData({ ...editFormData, header: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact</label>
                <input
                  type="text"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveSubmissionEdit()}
                  disabled={actionInProgress}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {actionInProgress ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => handleDeleteSubmission(editingSubmission)}
                  disabled={actionInProgress}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                >
                  {actionInProgress ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setEditingSubmission(null)}
                  disabled={actionInProgress}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Edit button to submissions */}
        {/* {activeTab === 'submissions' && submissions.length > 0 && submissions.map(submission => {
          const existingCard = document.querySelector(`[data-submission-id="${submission.id}"]`);
          if (existingCard) {
            const reviewBtn = existingCard.querySelector('button');
            if (reviewBtn && !existingCard.querySelector('[data-edit-btn]')) {
              const editBtn = document.createElement('button');
              editBtn.setAttribute('data-edit-btn', 'true');
              editBtn.innerHTML = 'Edit';
              editBtn.className = 'ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700';
              editBtn.onclick = () => handleEditSubmission(submission);
              reviewBtn.parentNode.insertBefore(editBtn, reviewBtn.nextSibling);
            }
          }
          return null;
        })} */}

        {/* Team Management Tab */}
        {activeTab === 'team-management' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">All Teams</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading teams...</p>
                </div>
              </div>
            ) : allTeams.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No teams found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {allTeams.map(team => (
                  <div key={team.name} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {editingTeam === team.name ? (
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              placeholder="New team name"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none"
                            />
                            <button
                              onClick={() => handleUpdateTeam(team.name)}
                              disabled={actionInProgress}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTeam(null)}
                              className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingTeam !== team.name && (
                          <>
                            <button
                              onClick={() => {
                                setEditingTeam(team.name);
                                setEditingTeamName(team.name);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.name)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Approvers:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.approvers?.map(approver => (
                          <span key={approver} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                            {approver}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Members ({team.members?.length || 0}):</p>
                      {team.members && team.members.length > 0 ? (
                        <div className="space-y-2">
                          {team.members.map(member => (
                            <div key={member.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              {editingMember === member.username ? (
                                <div className="flex gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingMemberUsername}
                                    onChange={(e) => setEditingMemberUsername(e.target.value)}
                                    placeholder="New username"
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveMemberUsername(member.username)}
                                    disabled={actionInProgress}
                                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingMember(null)}
                                    className="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-gray-700">{member.username}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingMember(member.username);
                                        setEditingMemberUsername(member.username);
                                      }}
                                      className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMember(member.username)}
                                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No members in this team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
