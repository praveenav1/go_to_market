import React from 'react';

function FilterBar({ tags, selectedTags, onTagChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Filter by Tags
      </h2>
      <div className="flex flex-wrap gap-3">
        {tags.length === 0 ? (
          <p className="text-gray-500">No tags available</p>
        ) : (
          tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <span className="ml-2">✓</span>
              )}
            </button>
          ))
        )}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={() => {
            document.querySelectorAll('button').forEach(btn => {
              // Reset by clearing selected tags through the parent
            });
          }}
          className="mt-4 text-sm text-secondary hover:text-primary underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
