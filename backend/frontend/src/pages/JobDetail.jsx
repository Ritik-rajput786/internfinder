import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getJobById } from '../services/api';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    // If navigation set state to openApply, open modal when job loaded
    if (location?.state?.openApply && job) {
      setApplyOpen(true);
    }
  }, [location, job]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobById(id);
      if (res.success) {
        setJob(res.data);
      } else {
        setError(res.message || 'Job not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!job) return null;

  const isExternal = (job.applyType && job.applyType === 'external') || (job.jobType && job.jobType === 'Platform');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
              <div className="text-gray-700 font-semibold mb-2">{job.company}</div>
              <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <span>{job.city || job.location}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">{job.type}</span>
                <span className="text-xs text-gray-500">{job.experience || '0-2 yrs'}</span>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="mb-2">
                <div className="inline-block px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 font-semibold">{job.salaryDisplay || 'Competitive'}</div>
              </div>
              {isExternal ? (
                <a href={job.applyUrl || '#'} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Apply on External Site</a>
              ) : (
                <button onClick={() => setApplyOpen(true)} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply Now</button>
              )}
            </div>
          </div>

          <hr className="my-4" />

          {/* Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Posted</h3>
              <div className="text-gray-800">{new Date(job.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Location & Role</h3>
              <div className="text-gray-800">{job.location} • {job.type}</div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <section>
              <h4 className="font-semibold mb-2">Job Description</h4>
              <div className="text-gray-700">{job.description}</div>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Responsibilities</h4>
              <ul className="list-disc pl-6 text-gray-700">
                {(job.responsibilities && job.responsibilities.length) ? job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                )) : (
                  <li>Responsibilities will be shared by the employer.</li>
                )}
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {(job.skills && job.skills.length) ? job.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-sm">{s}</span>
                )) : (
                  <span className="text-gray-600">Skills will be added by employer.</span>
                )}
              </div>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Eligibility</h4>
              <div className="text-gray-700">{job.eligibility || 'Open to all eligible candidates. Please check the role requirements.'}</div>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Perks</h4>
              <div className="flex flex-wrap gap-2">
                {(job.perks && job.perks.length) ? job.perks.map((p, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm">{p}</span>
                )) : (
                  <span className="text-gray-600">Standard company perks</span>
                )}
              </div>
            </section>

            <section>
              <h4 className="font-semibold mb-2">About Company</h4>
              <div className="text-gray-700">{job.aboutCompany || `${job.company || 'This company'} is a growing organisation based in India.`}</div>
            </section>
          </div>
        </div>
      </div>

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} onSuccess={() => { setApplyOpen(false); }} />
    </div>
  );
};

export default JobDetail;
