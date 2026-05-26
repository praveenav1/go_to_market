import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function AddGTMForm({ onSubmitted, editingResource }) {
  const [formData, setFormData] = useState({
    header: '',
    description: '',
    tags: [],
    videoFile: null,
    contact: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Pre-fill form when editingResource prop is provided
  useEffect(() => {
    if (editingResource) {
      setFormData({
        header: editingResource.header || '',
        description: editingResource.description || '',
        tags: editingResource.tags || [],
        videoFile: null,
        contact: editingResource.contact || ''
      });
      setEditingId(editingResource.id || null);
    }
  }, [editingResource]);

  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Fetch available tags from the API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tags`);
        setAllTags(response.data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError('Video file must be smaller than 500MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        videoFile: file
      }));
      setError(null);
    }
  };

  const addTag = (tag) => {
    const t = (tag || '').trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, t]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      if (!formData.header.trim()) {
        setError('Please enter a header');
        setLoading(false);
        return;
      }
      if (!formData.description.trim()) {
        setError('Please enter a description');
        setLoading(false);
        return;
      }
      if (formData.tags.length === 0) {
        setError('Please select at least one tag');
        setLoading(false);
        return;
      }
      if (!formData.videoFile) {
        setError('Please upload a video file');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('header', formData.header);
      submitData.append('description', formData.description);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('video', formData.videoFile);
      submitData.append('contact', formData.contact || '');

      // Submit to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/submissions`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      // Reset form
      setFormData({
        header: '',
        description: '',
        tags: [],
        videoFile: null
      });

      // Notify parent to refresh resources without full reload
      if (onSubmitted) onSubmitted();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(
        err.response?.data?.error ||
        'Failed to submit GTM resource. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Add my GTM</h1>
            <p className="text-gray-600 mb-6">
              Submit your GTM resource for admin approval. Once approved, it will be published to the GTM repository.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                ✓ Your GTM resource has been submitted for approval! An admin will review it shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div>
                <label htmlFor="header" className="block text-sm font-semibold text-slate-700 mb-2">
                  Resource Header *
                </label>
                <input
                  type="text"
                  id="header"
                  name="header"
                  value={formData.header}
                  onChange={handleInputChange}
                  placeholder="e.g., Product Launch Strategy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your GTM resource..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  disabled={loading}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags * (Select or create)
                </label>
                
                {/* Available tags */}
                {allTags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Available tags:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.includes(tag) || loading}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom tag input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleAddCustomTag}
                    placeholder="Type a tag and press Enter to add"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput.trim())}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={!tagInput.trim() || loading}
                  >
                    Add
                  </button>
                </div>

                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <div
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-700 hover:text-blue-900 font-bold"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                {/* Contact Person */}
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Person (email or name)
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Contact name or email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={loading}
                  />
                </div>

              {/* Video Upload */}
              <div>
                <label htmlFor="video" className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Video *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="video"
                    name="video"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="video"
                    className="cursor-pointer block"
                  >
                    <div className="text-gray-600 mb-2">
                      {formData.videoFile ? (
                        <>
                          <p className="font-semibold text-green-600">✓ Video selected</p>
                          <p className="text-sm">{formData.videoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">Click to upload video</p>
                          <p className="text-sm">or drag and drop</p>
                          <p className="text-xs text-gray-500">MP4, WebM, or other video format (Max 500MB)</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> After submission, your GTM resource will be reviewed by an administrator. 
                Once approved, it will appear on the main GTM repository page for all users to access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddGTMForm;
