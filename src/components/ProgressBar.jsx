import React from 'react';

function ProgressBar({ progress }) {
  if (!progress) return null;

  const { phase, percent, current } = progress;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">{phase}</span>
          <span className="text-blue-400 font-bold">{percent}%</span>
        </div>
        
        <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse-slow"></div>
          </div>
        </div>
        
        {current && (
          <div className="mt-2 text-sm text-gray-400 truncate">
            正在处理: {current}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressBar;