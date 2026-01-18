
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error Trap
window.addEventListener('error', (e) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = '#fee2e2';
  errorDiv.style.color = '#dc2626';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `<strong>Runtime Error:</strong><pre>${e.message}</pre>`;
  document.body.appendChild(errorDiv);
});

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e: any) {
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Mount Error</h1><pre>${e.message}\n${e.stack}</pre></div>`;
}
