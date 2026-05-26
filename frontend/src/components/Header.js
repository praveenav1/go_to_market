import React, { useState } from 'react';

function Header({ onNavigate, currentPage }) {
  const [showAdminLink, setShowAdminLink] = useState(false);

  // Easter egg: Press 'A' three times to show admin link
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === 'a') {
      setShowAdminLink(prev => !prev);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">GTM Repository</h1>
            <p className="text-lg text-blue-100">
              Go-to-Market Resources & Product Demos
            </p>
            <p className="text-sm text-blue-200 mt-2">
              Discover, explore, and access all your GTM assets in one place
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {/* {showAdminLink && ( */}
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === 'admin'
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                🔐 Admin Panel
              </button>
            {/* )} */}
            <button
              onClick={() => onNavigate(currentPage === 'home' ? 'add-gtm' : 'home')}
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              {currentPage === 'home' ? '+ Add my GTM' : '← Back to Repository'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
