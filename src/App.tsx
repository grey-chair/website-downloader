import React, { useState } from 'react';
import DownloadForm from './components/DownloadForm';
import DownloadList from './components/DownloadList';
import Header from './components/Header';

interface DownloadStatus {
  status: 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  started_at?: string;
  completed_at?: string;
  files?: string[];
  errors?: string[];
  url?: string;
  domain?: string;
}

interface Downloads {
  [key: string]: DownloadStatus;
}

const App: React.FC = () => {
  const [downloads, setDownloads] = useState<Downloads>({});
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = 'http://localhost:5001';

  const handleStartDownload = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok) {
        pollDownloadStatus(data.download_id, url);
      } else {
        alert(data.error || 'Failed to start download');
      }
    } catch (error) {
      alert('Failed to start download. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pollDownloadStatus = (downloadId: string, url: string) => {
    const domain = (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    })();
    setDownloads(prev => ({
      ...prev,
      [downloadId]: {
        status: 'downloading',
        progress: 0,
        message: 'Starting download...',
        url,
        domain,
      }
    }));
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${downloadId}`);
        const status = await response.json();
        setDownloads(prev => ({
          ...prev,
          [downloadId]: {
            ...prev[downloadId],
            ...status,
            domain: prev[downloadId]?.domain || (status.url ? new URL(status.url).hostname : undefined),
            url: prev[downloadId]?.url || status.url,
          }
        }));
        if (status.status === 'completed' || status.status === 'error') {
          clearInterval(interval);
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleViewDownload = (downloadId: string) => {
    window.open(`${API_BASE_URL}/api/files/${downloadId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <DownloadForm 
            onStartDownload={handleStartDownload}
            isLoading={isLoading}
          />
          <DownloadList 
            downloads={downloads}
            onViewDownload={handleViewDownload}
          />
        </div>
      </main>
    </div>
  );
};

export default App; 