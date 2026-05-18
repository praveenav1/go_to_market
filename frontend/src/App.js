import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ResourceGrid from './components/ResourceGrid';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [resources, setResources] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/resources`);
      const data = response.data;
      setResources(data);
      
      // Extract unique tags
      const tags = new Set();
      data.forEach(resource => {
        resource.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = selectedTags.length === 0
    ? resources
    : resources.filter(resource =>
        selectedTags.some(tag => resource.tags.includes(tag))
      );

  const handleTagChange = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <FilterBar
          tags={allTags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resources...</p>
            </div>
          </div>
        ) : (
          <ResourceGrid resources={filteredResources} />
        )}
      </div>
    </div>
  );
}

export default App;
