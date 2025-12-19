// Import React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Import CSS
import './index.css';
// Import App component
import App from './App.jsx';
// Import Auth Provider to wrap the app
import { AuthProvider } from './context/AuthContext';

// Render the app with AuthProvider wrapping it
// This makes authentication state available to all components
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
