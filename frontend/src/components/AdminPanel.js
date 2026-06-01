import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function AdminPanel({ onEdit }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchSubmissions();
  }, [filter]);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedTeam]);

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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Panel - GTM Submissions</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

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

                {(submission.team || submission.approver) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    {submission.team && (
                      <div>
                        <p className="font-semibold">Team:</p>
                        <p>{submission.team}</p>
                      </div>
                    )}
                    {submission.approver && (
                      <div>
                        <p className="font-semibold">Approver:</p>
                        <p>{submission.approver}</p>
                      </div>
                    )}
                  </div>
                )}

                {submission.review_notes && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="font-semibold text-sm text-gray-700 mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-600">{submission.review_notes}</p>
                  </div>
                )}

                {submission.status === 'pending' && (
                  <button
                    onClick={() => setSelectedSubmission(submission.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={actionInProgress}
                  >
                    Review
                  </button>
                )}
                {filter === 'all' && onEdit && (
                  <button
                    onClick={() => onEdit(submission)}
                    className="ml-3 px-3 py-1 bg-primary text-white rounded-md text-sm"
                  >
                    Edit
                  </button>
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
      </div>
    </div>
  );
}

export default AdminPanel;
