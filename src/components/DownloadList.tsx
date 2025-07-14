import React from 'react';

interface DownloadStatus {
  status: 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  started_at?: string;
  completed_at?: string;
  files?: string[];
  errors?: string[];
  folder_name?: string;
  domain?: string;
  download_method?: string;
}

interface Downloads {
  [key: string]: DownloadStatus;
}

interface DownloadListProps {
  downloads: Downloads;
  onViewDownload: (downloadId: string) => void;
}

const DownloadList: React.FC<DownloadListProps> = ({ downloads, onViewDownload }) => {
  const downloadEntries = Object.entries(downloads);

  const handleDownload = (downloadId: string, type: 'complete' | 'images' | 'html') => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    let endpoint = '';
    
    switch (type) {
      case 'complete':
        endpoint = `${baseUrl}/api/download-zip/${downloadId}`;
        break;
      case 'images':
        endpoint = `${baseUrl}/api/download-images/${downloadId}`;
        break;
      case 'html':
        endpoint = `${baseUrl}/api/download-html/${downloadId}`;
        break;
    }
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = endpoint;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (downloadEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Download History
        </h2>
        <p className="text-gray-500 text-center py-8">
          No downloads yet. Start by entering a URL above.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'downloading':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'downloading':
        return (
          <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Download History
      </h2>
      <div className="space-y-4">
        {downloadEntries.map(([downloadId, download]) => (
          <div 
            key={downloadId}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(download.status)}`}>
                  {getStatusIcon(download.status)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {download.domain || downloadId.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatTime(download.started_at)}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(download.status)}`}>
                {download.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {download.message}
            </p>
            
            {download.status === 'downloading' && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{download.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${download.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {download.status === 'completed' && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  Downloaded files: {download.files?.length || 0}
                  {download.download_method && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {download.download_method.toUpperCase()}
                    </span>
                  )}
                </p>
                
                {/* Download buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => handleDownload(downloadId, 'complete')}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    aria-label="Download complete scraped content"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Complete
                  </button>
                  
                  <button
                    onClick={() => handleDownload(downloadId, 'images')}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    aria-label="Download images only"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Images
                  </button>
                  
                  <button
                    onClick={() => handleDownload(downloadId, 'html')}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                    aria-label="Download HTML content only"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    HTML
                  </button>
                </div>
                
                <button
                  onClick={() => onViewDownload(downloadId)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  aria-label="View downloaded website"
                  tabIndex={0}
                >
                  View Website →
                </button>
              </div>
            )}
            
            {download.errors && download.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {download.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {download.completed_at && (
              <p className="text-xs text-gray-500 mt-2">
                Completed: {formatTime(download.completed_at)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadList; 