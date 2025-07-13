import React, { useState } from 'react';

interface DownloadFormProps {
  onStartDownload: (url: string) => void;
  isLoading: boolean;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ onStartDownload, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onStartDownload(url.trim());
      setUrl('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Download Website
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="url" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Website URL
          </label>
          <div className="flex space-x-3">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              disabled={isLoading}
              aria-label="Enter website URL to download"
              tabIndex={0}
            />
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Start website download"
              tabIndex={0}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg 
                    className="animate-spin h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Downloading...</span>
                </div>
              ) : (
                'Download'
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Enter a website URL to download the HTML page and all associated assets (CSS, JavaScript, images).
        </p>
      </form>
    </div>
  );
};

export default DownloadForm; 