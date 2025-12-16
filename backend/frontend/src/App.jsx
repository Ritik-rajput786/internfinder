// Import React Router components for routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Import Navbar component
import Navbar from './components/Navbar';
import Toast from './components/Toast';
// Import ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute';
// Import all pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import Companies from './pages/Companies';
import UploadJob from './pages/UploadJob';
import About from './pages/About';
import JobDetail from './pages/JobDetail';

// Main App Component
function App() {
  return (
    <Router>
      {/* Navbar appears on all pages */}
      <Navbar />
      <Toast />
      
      {/* Routes configuration */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/upload-job" element={
          <ProtectedRoute>
            <UploadJob />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        
        {/* Protected Routes - require authentication */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        {/* typo alias: support '/my-application' by redirecting */}
        <Route path="/my-application" element={<Navigate to="/my-applications" replace />} />
        
        {/* Catch all - redirect to home if route not found */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
