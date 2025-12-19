import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitApplication } from '../services/api';

const ApplyModal = ({ job, open, onClose, onSuccess, isApplied = false, existingApplication = null }) => {
  // Props: isApplied and existingApplication are provided by parent to prevent duplicate applies
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [skills, setSkills] = useState(''); // comma-separated
  const [message, setMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!open) {
      // reset form when closed
      setPhone('');
      setCollege('');
      setDegree('');
      setCurrentYear('');
      setSkills('');
      setMessage('');
      setResumeFile(null);
      setLoading(false);
      setProgress(0);
      setError('');
      setSuccess('');
    }
  }, [open]);

  if (!open || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Accept PDF only
    if (!file.name.toLowerCase().match(/\.(pdf)$/)) {
      setError('Only PDF resumes are allowed');
      return;
    }
    setError('');
    setResumeFile(file);
  };

  // Ensure user is authenticated before submitting/uploading
  const requireAuth = () => {
    if (!isAuthenticated) {
      setError('Please sign in to apply. Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } }), 900);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!requireAuth()) return;

    // Prevent duplicate apply (frontend guard)
    if (isApplied) {
      setError('You have already applied for this job');
      return;
    }

    if (!fullName || !email || !phone || !resumeFile) {
      setError('Please fill required fields and upload your resume (PDF)');
      return;
    }

    const formData = new FormData();
    formData.append('jobId', job._id || job.id);
    formData.append('fullName', fullName);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (college) formData.append('college', college);
    if (degree) formData.append('degree', degree);
    if (currentYear) formData.append('currentYear', currentYear);
    if (skills) formData.append('skills', skills);
    if (message) formData.append('message', message);
    formData.append('resume', resumeFile);

    try {
      setLoading(true);
+      // Small immediate feedback to confirm the submit handler fired
+      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Submitting application...', type: 'info' } }));
+      console.log('ApplyModal: submitting application for job', job._id || job.id);
      const response = await submitApplication(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      if (response.success) {
        setSuccess('✅ Application submitted successfully!');
        // Notify parent and other pages through an event and global toast
        const application = response.application;
        const jobId = application.jobId?._id || application.jobId;
        if (onSuccess) onSuccess(application);
        window.dispatchEvent(new CustomEvent('applicationSubmitted', { detail: { jobId, application, apps: response.data } }));
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application submitted successfully', type: 'success' } }));

        // close after short delay
        setTimeout(() => {
          setLoading(false);
          onClose(true);
        }, 1200);
      } else {
        setError(response.message || 'Failed to submit application');
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: response.message || 'Failed to submit application', type: 'error' } }));
        setLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Session expired or not signed in. Redirecting to login...');
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Please sign in to apply', type: 'error' } }));
        setTimeout(() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } }), 900);
      } else {
        const msg = err.response?.data?.message || 'Failed to submit application';
        setError(msg);
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: msg, type: 'error' } }));
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Apply for {job.title}</h2>
            <div className="text-sm text-gray-600">{job.company} • {job.city || job.location} • {job.salaryDisplay || 'Competitive'}</div>
          </div>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3 py-2 border rounded" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 border rounded" required />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-3 py-2 border rounded" required />
            <input type="text" placeholder="College / University" value={college} onChange={(e) => setCollege(e.target.value)} className="px-3 py-2 border rounded" />
            <input type="text" placeholder="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} className="px-3 py-2 border rounded" />
            <input type="text" placeholder="Current Year" value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} className="px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Skills (comma separated)</label>
            <input type="text" placeholder="e.g. React, Node, SQL" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Why should we hire you?</label>
            <textarea placeholder="A short note about yourself" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded h-28" />
          </div>

          <div>
              <label className="text-sm text-gray-600">Upload Resume (PDF)</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="mt-1" disabled={!isAuthenticated} />
              {progress > 0 && (
                <div className="w-full bg-gray-100 rounded mt-2">
                  <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded" style={{ width: `${progress}%` }}>{progress}%</div>
                </div>
              )}
              {!isAuthenticated && (
                <div className="text-sm text-yellow-700 mt-2">You must <button onClick={() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } })} className="underline">sign in</button> to upload a resume and apply.</div>
              )}
            </div>
          {error && <div className="text-red-600">{error}</div>}
                  {isApplied && (
                    <div className="text-yellow-700">You have already applied for this job. You can view or cancel your application from <a href="/my-applications" className="underline">My Applications</a>.</div>
                  )}
          {success && <div className="text-green-600">{success}</div>}

          <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => onClose(false)} className="px-4 py-2 border rounded">Cancel</button>
              {!isAuthenticated ? (
                <button type="button" onClick={() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } })} className="px-4 py-2 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700">
                  Sign in to Apply
                </button>
              ) : (
                <button type="submit" disabled={loading || isApplied} className={`px-4 py-2 rounded font-semibold text-white ${loading || isApplied ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}>
                  {loading ? 'Submitting...' : (isApplied ? 'Already Applied' : 'Submit Application')}
                </button>
              )}
            </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
