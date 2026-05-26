import React, { useState } from 'react';
import ResourceCard from './ResourceCard';

function ResourceGrid({ resources, onEdit, showEdit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No resources found</p>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        resources.map(resource => (
          <ResourceCard key={resource.id} resource={{...resource, showEdit}} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}

export default ResourceGrid;
