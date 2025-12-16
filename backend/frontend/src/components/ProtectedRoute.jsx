// Import React Router hooks
import { Navigate } from 'react-router-dom';
// Import auth hook
import { useAuth } from '../context/AuthContext';

// Protected Route Component
// This component protects routes that require authentication
const ProtectedRoute = ({ children }) => {
  // Get authentication state
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;


