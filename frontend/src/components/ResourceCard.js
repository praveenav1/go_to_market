import React, { useState } from 'react';
import VideoModal from './VideoModal';

function ResourceCard({ resource }) {
  const [showVideo, setShowVideo] = useState(false);

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

          {/* Demo Button */}
          <button
            onClick={() => setShowVideo(true)}
            className="mt-auto bg-accent hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Watch Demo
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <VideoModal
          videoUrl={resource.video_url}
          header={resource.header}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
}

export default ResourceCard;
