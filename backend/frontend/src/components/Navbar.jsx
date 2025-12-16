// Import React Router hooks for navigation
import { Link, useNavigate } from 'react-router-dom';
// Import auth hook
import { useAuth } from '../context/AuthContext';

// Navbar Component - matches the reference design
const Navbar = () => {
  // Get authentication state and logout function
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">
              JobFinder
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Find Job
            </Link>
            <Link
              to="/companies"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Companies
            </Link>
            <Link
              to="/upload-job"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Upload Job
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Show user menu if logged in */}
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 text-sm hidden sm:inline">
                    {user?.name}
                  </span>
                  {isAuthenticated && (
                    <Link
                      to="/my-applications"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                    >
                      My Applications
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Sign In button if not logged in */}
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
