import React, { useState } from 'react';
import logo from '../assets/logo.webp';

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
              <div className="w-16 h-16 rounded-sm overflow-hidden bg-ey-black flex items-center justify-center">
                <img src={logo} alt="Brand logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">AI Experience Hub</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-gray-300">AIE</span>
                </div>
                <p className="text-xs text-gray-400">AI Experience portal</p>
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
            {['All', 'Assets & Accelerator'].map(tab => (
              <a
                key={tab}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onTabSelect(tab);
                }}
                className={`px-3 py-2 text-sm transition-colors ${selectedTab === tab ? 'text-ey-yellow font-semibold' : 'text-gray-200 hover:text-white'}`}
              >
                <span>{tab}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
