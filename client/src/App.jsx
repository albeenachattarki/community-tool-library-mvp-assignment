import React, { useState, useEffect } from 'react';
import ToolList from './components/ToolList';
import AddToolForm from './components/AddToolForm';
import './App.css';

function App() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // MAJOR FRONTEND BUG 1: Infinite Loop / Component Re-mounting
  // We are missing the dependency array [] in this useEffect.
  // This causes the component to fetch, set state, re-render, and fetch again indefinitely.
  useEffect(() => { 
    console.log("Fetching tools...");
    fetchTools(); 
  }, []); 

  const fetchTools = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await fetch('/api/tools');
      if (!response.ok) throw new Error('Unable to load tools.');
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setLoadError('Unable to load tools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToolAdded = () => {
    fetchTools();
  };

  const handleToolUpdate = (updatedTool) => {
    setTools((currentTools) => currentTools.map((tool) => (
      tool.id === updatedTool.id ? updatedTool : tool
    )));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <span className="icon">🛠️</span>
          <h1>Community Tool Library</h1>
        </div>
        <p className="subtitle">Borrow what you need. Share what you own.</p>
      </header>

      <main className="app-content">
        <section>
          <AddToolForm onToolAdded={handleToolAdded} />
        </section>
        <section>
          {loading
            ? <div className="loader">Loading tools...</div>
            : loadError
              ? <div className="empty-msg" role="alert">{loadError}</div>
            : <ToolList tools={tools} onUpdateTool={handleToolUpdate} />
          }
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Community Tool Library</p>
      </footer>
    </div>
  );
}

export default App;
