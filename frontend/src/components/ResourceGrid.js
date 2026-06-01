import React from 'react';
import ResourceCard from './ResourceCard';

function ResourceGrid({ resources, onEdit, showEdit }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full py-20 text-center">
          
          {/* Icon */}
          <div className="bg-gray-100 p-6 rounded-full shadow-sm mb-6">
            <svg
              className="w-14 h-14 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Text */}
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Resources Yet
          </h3>
          <p className="text-gray-500 max-w-sm">
            We’re working on adding content here. Stay tuned for updates or check back later.
          </p>

          {/* Optional CTA */}
          <button className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="transform transition duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl"
            >
              <ResourceCard
                resource={{ ...resource, showEdit }}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceGrid;