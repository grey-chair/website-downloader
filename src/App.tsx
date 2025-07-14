import React, { useState } from 'react';
import DownloadForm from './components/DownloadForm';
import Header from './components/Header';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = 'http://localhost:5001';

  const handleStartDownload = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/download-in-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to download');
        setIsLoading(false);
        return;
      }
      // Get filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'website-scraped-content.zip';
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }
      // Download the blob
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      alert('Failed to download. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        </div>
      </main>
    </div>
  );
};

export default App; 