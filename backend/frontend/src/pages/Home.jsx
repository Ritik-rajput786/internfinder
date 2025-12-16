// Import React hooks
import { useState, useEffect } from 'react';
// Import API functions - both platform and external jobs
import { getJobs, getExternalJobs } from '../services/api';
// Import JobCard component
import JobCard from '../components/JobCard';
// Import JobCardSkeleton for loading state
import JobCardSkeleton from '../components/JobCardSkeleton';
// Import React Router for navigation
import { useNavigate } from 'react-router-dom';

// Home Page Component - matches the reference design
const Home = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for search inputs
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  // Tag buttons data
  const tags = [
    'Software Engineer',
    'Developer',
    'Full-Stack Developer',
    'Data Scientist',
    'Remote',
    'Full-Time',
    'Sales',
    'Office Assistant',
  ];

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to fetch jobs from both sources (Platform + External APIs)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch platform jobs from MongoDB (our database)
      const platformResponse = await getJobs();
      let platformJobs = [];
      if (platformResponse.success) {
        platformJobs = platformResponse.data.map(job => ({
          ...job,
          source: 'platform' // Mark as platform job
        }));
      }

      // Fetch external jobs from public APIs (Remotive, etc.)
      let externalJobs = [];
      try {
        const externalResponse = await getExternalJobs();
        if (externalResponse.success && externalResponse.data) {
          externalJobs = externalResponse.data.map(job => ({
            ...job,
            source: 'external' // Already marked in backend
          }));
        }
      } catch (externalError) {
        // If external API fails, continue with platform jobs only
        console.error('Error fetching external jobs:', externalError);
      }

      // Merge both job sources and show latest 9 jobs
      const allJobs = [...platformJobs, ...externalJobs];
      setJobs(allJobs.slice(0, 9));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search parameters
    navigate('/jobs', {
      state: { title: searchTitle, location: searchLocation },
    });
  };

  // Handle tag click - filter by tag
  const handleTagClick = (tag) => {
    navigate('/jobs', {
      state: { title: tag, location: searchLocation },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Dream Job with Ease
            </h1>

            {/* Large Rounded Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-4xl mx-auto bg-gray-50 rounded-full shadow-lg p-2 flex flex-col md:flex-row gap-2"
            >
              <input
                type="text"
                placeholder="Job title / keyword"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition shadow-md"
              >
                Search
              </button>
            </form>

            {/* Tag Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-full text-sm font-medium transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Job Opportunities</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All →
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">No jobs available at the moment.</div>
          </div>
        ) : (
          // Jobs Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
