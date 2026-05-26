import React from 'react';

function FilterBar({ tags, selectedTags, onTagChange, onClear }) {
  return (
    <div className="bg-white rounded-lg shadow-sm px-4 py-3">
      <h2 className="text-sm font-semibold text-gray-800 mb-2">
        Filter by Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-gray-500">No tags available</p>
        ) : (
          tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-secondary text-white shadow-sm'
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
          onClick={() => onClear && onClear()}
          className="mt-3 text-sm text-secondary hover:text-primary underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
