// Import React hooks
import { useState } from 'react';
import { cancelApplication as cancelByJob } from '../services/applicationService';
import ConfirmModal from './ConfirmModal';
// Import auth hook
import { useAuth } from '../context/AuthContext';
// Import React Router for navigation (used as a fallback)
import { useNavigate, Link } from 'react-router-dom';

// JobCard Component - Enhanced with better styling and animations
const JobCard = ({ job, onApplySuccess, onOpenApply, isApplied = false, application = null }) => {
  // Get authentication state
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle apply button click - different behavior for internal vs external jobs
  const handleApply = async () => {
    // Only true 'external' applyType should redirect to other site
    const isExternalJob = (job.applyType && job.applyType === 'external');

    if (isExternalJob) {
      const applyTarget = job.applyUrl || job.applyLink || job.applyTarget || '#';
      if (applyTarget && applyTarget !== '#') {
        window.open(applyTarget, '_blank', 'noopener,noreferrer');
        setMessage('Opening application page...');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Application link not available');
        setTimeout(() => setMessage(''), 3000);
      }
      return;
    }

    // For external jobs open external link
    if (isExternalJob) return; // handled above

    // Open the apply modal through parent handler if provided
    if (onOpenApply) {
      onOpenApply(job);
      return;
    }

    // Fallback: navigate to job detail with request to open apply modal
    try {
      const id = job._id || job.id || job.externalId;
      if (id) navigate(`/jobs/${id}`, { state: { openApply: true } });
    } catch (err) {
      // swallow navigation error quietly (no console logs in production)
    };
  };

  // Get company initial for logo placeholder with gradient background
  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  // Get gradient color based on company initial
  const getGradientColor = (initial) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-green-500 to-teal-600',
      'from-teal-500 to-cyan-600',
      'from-cyan-500 to-blue-600',
    ];
    const index = (initial.charCodeAt(0) || 65) % gradients.length;
    return gradients[index];
  };

  // Determine badge color and text based on job type
  const getJobTypeInfo = () => {
    if (job.type === 'Job') {
      return { text: 'Full-Time', color: 'bg-gradient-to-r from-green-400 to-green-600 text-white' };
    } else {
      return { text: 'Internship', color: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' };
    }
  };

  const jobTypeInfo = getJobTypeInfo();
  const gradientColor = getGradientColor(getCompanyInitial(job.company));

  // Compute button text/content outside JSX to avoid nested ternaries and JSX syntax errors
  const platformName = job.applyPlatform || job.platform || null;
  // Treat only explicit external applyType as external; Platform jobs should use internal apply flow (open modal)
  const isExternalJob = (job.applyType && job.applyType === 'external');

  const buttonText = (() => {
    if (loading) {
      return (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Applying...
        </span>
      );
    }

    if (isExternalJob) {     return platformName ? `Apply on ${platformName}` : 'Apply on External Site →';
    }

    return message || 'Apply Now';
  })();

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 p-6 border border-gray-100 transform hover:-translate-y-1 hover:scale-[1.01]">
      <div className="flex items-start space-x-4">
        {/* Company Logo - Enhanced with gradient */}
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center shadow-md`}>
            <span className="text-2xl font-bold text-white">
              {getCompanyInitial(job.company)}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          {/* Job Type and Source Badges */}
          <div className="mb-3 flex flex-wrap gap-2 items-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${jobTypeInfo.color}`}>
              {jobTypeInfo.text}
            </span>

            {/* City Badge (India) */}
            {job.city && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-800">
                {job.city}
              </span>
            )}

            {/* Source Badge (External vs Platform) */}
            {isExternalJob ? (
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-sm">
                  External Job
                </span>
                {job.sourceName && (
                  <span className="text-xs text-gray-500">{job.sourceName}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm">
                  Platform Job
                </span>
                {job.sourceName && (
                  <span className="text-xs text-gray-500">{job.sourceName}</span>
                )}
              </div>
            )}

            {/* Indian Opportunity + Verified Badges */}
            {(job.country === 'India' || (job.location || '').toLowerCase().includes('india') || job.city?.toLowerCase()?.includes('india')) && (
              <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 rounded text-xs font-medium">
                <span className="text-sm">🇮🇳</span>
                <span>Indian Opportunity</span>
              </span>
            )}

            {job.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Verified</span>
              </span>
            )}

            {/* Platform badge for known Indian platforms */}
            {platformName === 'Internshala' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20v11"/></svg>
                Internshala
              </span>
            )}
            {platformName === 'Unstop' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                Unstop
              </span>
            )}
            {platformName === 'Microsoft' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/></svg>
                Microsoft
              </span>
            )}
            {platformName === 'Amazon' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/></svg>
                Amazon
              </span>
            )}
            {platformName === 'Google' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                Google
              </span>
            )}
          </div>

          {/* Job Title */}
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate hover:text-blue-600 transition-colors">
                <Link to={`/jobs/${job._id || job.id}`} className="hover:underline">{job.title}</Link>
              </h3>
              {/* Company Name */}
              <p className="text-base text-gray-700 mb-2 font-semibold truncate">{job.company}</p>
              {/* Skills preview */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(job.skills || job.skillsRequired || []).slice(0,3).map((s,i) => (
                  <span key={i} className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-700">{s}</span>
                ))}
              </div>
            </div>
            {/* Salary badge if available */}
            <div className="ml-4">
              {job.salaryDisplay && <div className="inline-block px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs font-bold">{job.salaryDisplay}</div>}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-500 mb-3">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="text-sm">{job.city || job.location}</span>
          </div>

          {/* Description (truncated) */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {job.description}
          </p>

          {/* Apply / Applied Actions */}
          {isApplied ? (
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 px-4 rounded-lg font-semibold bg-green-500 text-white shadow-md flex items-center justify-center gap-2" disabled>
                ✅ Applied
              </button>
              <>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-lg font-semibold bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-red-50 disabled:opacity-60"
                >
                  {loading ? 'Cancelling...' : 'Cancel Application'}
                </button>

                <ConfirmModal
                  open={showConfirm}
                  title="Cancel Application"
                  message="Are you sure you want to cancel this application?"
                  confirmText="Yes, cancel"
                  cancelText="No"
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={async () => {
                    setShowConfirm(false);
                    setMessage('');
                    setLoading(true);
                    try {
                      const jobId = job._id || job.id;
                      if (!jobId) {
                        setMessage('Job id not available');
                        return;
                      }
                      const res = await cancelByJob(jobId);
                      if (res && res.success) {
                        window.dispatchEvent(new CustomEvent('applicationCancelled', { detail: { jobId } }));
                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application cancelled successfully', type: 'success' } }));
                        if (onApplySuccess) onApplySuccess();
                      } else {
                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: res?.message || 'Failed to cancel', type: 'error' } }));
                      }
                    } catch (err) {
                      setMessage(err.response?.data?.message || 'Failed to cancel');
                    } finally {
                      setLoading(false);
                      setTimeout(() => setMessage(''), 2200);
                    }
                  }}
                />
              </>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={loading || (job.applyType === 'internal' && !!message)}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-transform duration-200 transform active:scale-95 ${
                loading || (job.applyType === 'internal' && message)
                  ? 'bg-gray-400 cursor-not-allowed text-white shadow-none'
                  : message && message.includes('success')
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                  : isExternalJob
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{buttonText}</span>
                {!loading && (
                  <svg className="w-4 h-4 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
