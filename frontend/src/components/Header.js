import React from 'react';

function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">GTM Repository</h1>
        <p className="text-lg text-blue-100">
          Go-to-Market Resources & Product Demos
        </p>
        <p className="text-sm text-blue-200 mt-2">
          Discover, explore, and access all your GTM assets in one place
        </p>
      </div>
    </header>
  );
}

export default Header;
