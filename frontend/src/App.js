import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ResourceGrid from './components/ResourceGrid';
import AddGTMForm from './components/AddGTMForm';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';
import API_BASE_URL from './config';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'add-gtm'
  const [resources, setResources] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [editingResource, setEditingResource] = useState(null);
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

  // apply search and tabs
  const visibleResources = filteredResources.filter(r => {
    if (searchQuery && !r.header.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedTab && selectedTab !== 'All') {
      return r.tags && r.tags.includes(selectedTab);
    }
    return true;
  });

  const handleTagChange = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => setSelectedTags([]);

  const handleSubmitted = () => {
    // Refresh resources without full reload and go back to home
    fetchResources();
    setCurrentPage('home');
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setCurrentPage('add-gtm');
  };

  const handleSearch = (q) => setSearchQuery(q || '');

  const handleTabSelect = (tab) => setSelectedTab(tab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} onSearch={handleSearch} selectedTab={selectedTab} onTabSelect={handleTabSelect} />
      
      {currentPage === 'home' ? (
        // Main Repository Page
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <FilterBar
              tags={allTags}
              selectedTags={selectedTags}
              onTagChange={handleTagChange}
              onClear={handleClearFilters}
            />
          </div>
          
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
              <ResourceGrid resources={visibleResources} onEdit={handleEdit} showEdit={false} />
          )}
        </div>
          ) : currentPage === 'add-gtm' ? (
        // Add GTM Page
        <AddGTMForm onSubmitted={handleSubmitted} editingResource={editingResource} />
      ) : currentPage === 'admin' ? (
        // Admin Panel Page
          <AdminPanel onEdit={handleEdit} />
      ) : null}
    </div>
  );
}

export default App;
