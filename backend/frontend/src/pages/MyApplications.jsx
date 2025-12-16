// Import React hooks
import { useState, useEffect } from 'react';
// Import React Router for navigation
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
// Import API function
import { getMyApplications, cancelApplication } from '../services/api';

// MyApplications Page Component
const MyApplications = () => {
  // State for applications data
  const [applications, setApplications] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for error
  const [error, setError] = useState('');

  // Retry key (declare before effects so it's available in deps)
  const [retryKey, setRetryKey] = useState(0); // change to re-trigger fetch on retry

  // Fetch applications when component mounts
  useEffect(() => {
    fetchApplications();

    const onSubmitted = (e) => {
      // When an application is submitted elsewhere, re-fetch to get fully populated data
      // and ensure we only show active applications (status === 'Applied')
      fetchApplications();
    };

    window.addEventListener('applicationSubmitted', onSubmitted);
    return () => window.removeEventListener('applicationSubmitted', onSubmitted);
  }, [retryKey]);

  // Track which applications are being processed for cancel to disable button
  const [processingIds, setProcessingIds] = useState(new Set());
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  // Listen for global cancel events so this page can remove cancelled apps
  useEffect(() => {
    const onCancelled = (e) => {
      const jobId = e.detail?.jobId;
      if (!jobId) return;
      setApplications((prev) => (prev || []).filter(a => (a.jobId?._id || a.jobId) !== jobId));
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application cancelled successfully', type: 'success' } }));
    };
    window.addEventListener('applicationCancelled', onCancelled);
    return () => window.removeEventListener('applicationCancelled', onCancelled);
  }, []);

  // Function to fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyApplications();
      if (response.success) {
        // Only display active (Applied) applications
        const activeApps = Array.isArray(response.data) ? response.data.filter(a => a.status === 'Applied') : [];
        setApplications(activeApps);
      } else {
        setError(response.message || 'Failed to fetch applications');
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        setError('Please sign in to view your applications.');
        // Show a login CTA instead of immediate redirect
      } else {
        setError(error.response?.data?.message || 'Failed to fetch applications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track all the jobs and internships you've applied for
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading your applications...</div>
          </div>
        ) : error ? (
          // Error State
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="mb-2">{error}</div>
            <div className="flex gap-3">
              <button onClick={() => setRetryKey(k => k + 1)} className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Retry</button>
              {error && error.toLowerCase().includes('sign in') && (
                <Link to="/login" className="inline-block bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md">Sign in</Link>
              )}
            </div>
          </div>
        ) : applications.length === 0 ? (
          // Empty State
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-xl text-gray-600 mb-2">
              You haven't applied to any jobs yet.
            </div>
            <div className="text-gray-500 mb-4">
              Start browsing jobs and internships to apply!
            </div>
            <Link
              to="/jobs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          // Applications List
          <>
            <div className="space-y-4">
            {applications.map((application) => {
              const job = application.jobId;

              // If the linked job was removed/deleted, render a safe fallback
              if (!job) {
                return (
                  <div key={application._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">This job is no longer available.</h3>
                        <p className="text-gray-600 mb-4">The job has been removed from the platform and is no longer available.</p>
                        <div className="text-sm text-gray-500">Applied on: {formatDate(application.appliedAt)}</div>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end gap-3">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${application.status === 'Applied' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                          {application.status}
                        </span>
                        {/* If job no longer exists, do not show Apply/Cancel buttons */}
                      </div>
                    </div>
                  </div>
                );
              }

              const badgeColor = job?.type === 'Job' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';

              return (
                <div
                  key={application._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Job Details */}
                    <div className="flex-1">
                      {/* Type Badge */}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${badgeColor}`}
                      >
                        {job?.type || '—'}
                      </span>

                      {/* Job Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job?.title || 'Untitled position'}
                      </h3>

                      {/* Company Name */}
                      <p className="text-lg text-gray-700 mb-2 font-semibold">
                        {job?.company || 'Unknown Company'}
                      </p>

                      {/* Location */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{job?.location || '—'}</span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job?.description || ''}
                      </p>

                      {/* Applied Date */}
                      <div className="text-sm text-gray-500">
                        Applied on: {formatDate(application.appliedAt)}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end gap-3">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${application.status === 'Applied' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                        {application.status}
                      </span>
                      {application.status === 'Applied' && (
                        <div className="flex items-center gap-2">
                          <Link to={`/jobs`} className="text-sm text-gray-600 hover:text-gray-800">View Job</Link>
                              <>
                                <button
                                  onClick={() => { setCancelTarget(application); setShowConfirm(true); }}
                                  disabled={processingIds.has(application._id)}
                                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                >
                                  {processingIds.has(application._id) ? 'Cancelling...' : 'Cancel Application'}
                                </button>

                                <ConfirmModal
                                  open={showConfirm && cancelTarget?._id === application._id}
                                  title="Cancel Application"
                                  message="Are you sure you want to cancel this application?"
                                  confirmText="Yes, cancel"
                                  cancelText="No"
                                  onCancel={() => { setShowConfirm(false); setCancelTarget(null); }}
                                  onConfirm={async () => {
                                    setShowConfirm(false);
                                    if (!cancelTarget) return;
                                    const appId = cancelTarget._id;
                                    setProcessingIds((prev) => new Set(prev).add(appId));
                                    try {
                                      const res = await cancelApplication(appId);
                                      if (res && res.success) {
                                        setApplications((prev) => prev.filter((a) => a._id !== appId));
                                        const jobId = cancelTarget.jobId?._id || cancelTarget.jobId;
                                        if (jobId) window.dispatchEvent(new CustomEvent('applicationCancelled', { detail: { jobId } }));
                                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application cancelled successfully', type: 'success' } }));
                                      } else {
                                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: res?.message || 'Failed to cancel application', type: 'error' } }));
                                      }
                                    } catch (err) {
                                      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: err.response?.data?.message || 'Failed to cancel application.', type: 'error' } }));
                                    } finally {
                                      setProcessingIds((prev) => {
                                        const s = new Set(prev);
                                        s.delete(appId);
                                        return s;
                                      });
                                      setCancelTarget(null);
                                    }
                                  }}
                                />
                              </>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>          </>        )}
      </div>
    </div>
  );
};

export default MyApplications;

