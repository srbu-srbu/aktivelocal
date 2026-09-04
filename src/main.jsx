import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializeWebMCP } from './lib/webmcp';

// Ensure WebMCP tools are attached to navigator.modelContext & window.mcp immediately on script start
initializeWebMCP();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
