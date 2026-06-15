import { useState, useEffect } from 'react';
import './FileExplorer.css';

const API_BASE = 'http://127.0.0.1:3001';

type FileEntry = {
  name: string;
  isDirectory: boolean;
  path: string;
};

export function FileExplorer() {
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = (dir?: string) => {
    setLoading(true);
    setError(null);
    const url = dir ? `${API_BASE}/api/files?dir=${encodeURIComponent(dir)}` : `${API_BASE}/api/files`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCurrentDir(data.currentDir);
          setFiles(data.files);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleGoUp = () => {
    if (!currentDir) return;
    // Basic parent directory calculation for Windows paths
    const parts = currentDir.split('\\');
    if (parts.length > 1) {
      // If it's something like "C:\" going up doesn't make sense, but we let backend handle errors
      parts.pop();
      let parent = parts.join('\\');
      if (parent.endsWith(':')) parent += '\\';
      fetchFiles(parent);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <button onClick={handleGoUp} disabled={!currentDir || currentDir.length <= 3}>
          ⬆ Up
        </button>
        <div className="current-path">{currentDir || 'Loading...'}</div>
      </div>
      
      {error && <div className="error-msg">{error}</div>}
      
      <div className="file-list">
        {loading ? (
          <div className="loading">Loading directory contents...</div>
        ) : (
          files.map(file => (
            <div 
              key={file.path} 
              className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}
              onClick={() => file.isDirectory && fetchFiles(file.path)}
            >
              <span className="icon">{file.isDirectory ? '📁' : '📄'}</span>
              <span className="name">{file.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
