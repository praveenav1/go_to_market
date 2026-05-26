import React from 'react';

function ResourceCard({ resource, onEdit }) {

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-secondary p-4">
          <h3 className="text-xl font-bold text-white">{resource.header}</h3>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Description */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {resource.description}
          </p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {resource.tags.map(tag => (
              <span
                key={tag}
                className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs font-semibold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Contact */}
          {resource.contact && (
            <div className="text-sm text-gray-600 mb-2">
              <strong>Contact:</strong> {resource.contact}
            </div>
          )}

          {/* Video Player */}
          <div className="mt-4 bg-black rounded-lg overflow-hidden">
            {console.log('Video URL:', resource.video_url)}
            <video
              controls
              className="w-full h-auto"
              controlsList="nodownload"
            >
              <source src={resource.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 flex gap-2">
            {onEdit && resource && resource.showEdit && (
              <button
                onClick={() => onEdit && onEdit(resource)}
                className="px-3 py-1 text-sm bg-primary text-white rounded"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResourceCard;
