import React, { useState } from 'react';

function Header({ onNavigate, currentPage, onSearch, selectedTab, onTabSelect }) {
  const [query, setQuery] = useState('');

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (onSearch) onSearch(v);
  };

  return (
    <header className="bg-ey-black text-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ey-yellow rounded-sm flex items-center justify-center font-bold text-ey-black">EY</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">Go-To-Market</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-gray-300">AIE</span>
                </div>
                <p className="text-xs text-gray-400">GTM resource portal</p>
              </div>
            </div>
          </div>

          <div className="order-last lg:order-none lg:flex-1">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-black shadow-sm">
              <span className="text-gray-500">🔍</span>
              <input
                type="search"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search this site"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentPage === 'admin'
                  ? 'bg-ey-yellow text-ey-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              🔐 Admin Panel
            </button>
            <button
              onClick={() => onNavigate(currentPage === 'home' ? 'add-gtm' : 'home')}
              className="px-4 py-2 bg-ey-yellow text-ey-black font-semibold rounded-md hover:opacity-95 transition-colors"
            >
              {currentPage === 'home' ? '+ Add my GTM' : '← Back to repository'}
            </button>
          </div>
        </div>

        {onTabSelect && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-800 pt-3">
            {['All', 'Assets', 'Accelerator'].map(tab => (
              <button
                key={tab}
                onClick={() => onTabSelect(tab)}
                className={`px-3 py-2 rounded-full text-sm ${selectedTab === tab ? 'bg-ey-yellow text-ey-black' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
