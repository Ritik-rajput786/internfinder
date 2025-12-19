// Import React hooks
import { useState, useEffect } from 'react';
// Import API function
import { getCompanies } from '../services/api';
// Import CompanyCard component
import CompanyCard from '../components/CompanyCard';
// Import CompanyCardSkeleton for loading state
import CompanyCardSkeleton from '../components/CompanyCardSkeleton';

// Companies Page Component - Modern professional design
const Companies = () => {
  // State for companies data
  const [companies, setCompanies] = useState([]);
  // State for filtered companies
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for filters
  const [searchName, setSearchName] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  // State for pagination
  const [displayCount, setDisplayCount] = useState(12); // Show 12 companies initially

  // Fixed industry options (student-friendly)
  const industries = ['All', 'IT & Software', 'FinTech', 'EdTech', 'E-commerce'];
  // Fixed Indian city options
  const locations = ['All', 'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Noida','Gurugram','Kolkata','Ahmedabad','Jaipur','Indore','Remote India'];

  // Fetch companies when component mounts
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter companies when filters change
  useEffect(() => {
    filterCompanies();
  }, [companies, searchName, filterIndustry, filterLocation]);

  // Function to fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies();
      if (response.success) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } else {
        console.error('Failed to fetch companies:', response.message);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to filter companies
  const filterCompanies = () => {
    let filtered = [...companies];

    // Filter by company name (case-insensitive)
    if (searchName) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by industry
    if (filterIndustry !== 'All') {
      filtered = filtered.filter((company) => company.industry === filterIndustry);
    }

    // Filter by location (city)
    if (filterLocation !== 'All') {
      filtered = filtered.filter((company) => company.city === filterLocation);
    }

    setFilteredCompanies(filtered);
  };

  // Get displayed companies (for pagination/load more)
  const displayedCompanies = filteredCompanies.slice(0, displayCount);
  const hasMore = filteredCompanies.length > displayCount;

  // Handle Load More
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Companies Hiring Now
          </h1>
          <p className="text-lg text-gray-600">
            Explore companies offering jobs and internships
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Company
              </label>
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
              />
            </div>

            {/* Filter by Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white transition-all"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white transition-all"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-blue-600">{displayedCompanies.length}</span> of{' '}
              <span className="font-bold text-gray-900">{filteredCompanies.length}</span> companies
            </div>
            {(searchName || filterIndustry !== 'All' || filterLocation !== 'All') && (
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterIndustry('All');
                  setFilterLocation('All');
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State - Using Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <CompanyCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div className="text-2xl font-bold text-gray-700 mb-2">
              No companies found
            </div>
            <div className="text-gray-500 mb-6">
              {searchName || filterIndustry !== 'All' || filterLocation !== 'All'
                ? 'Try adjusting your filters to find more companies.'
                : 'No companies available at the moment. Jobs are being fetched from external APIs.'}
            </div>
            {(searchName || filterIndustry !== 'All' || filterLocation !== 'All') ? (
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterIndustry('All');
                  setFilterLocation('All');
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={fetchCompanies}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry Loading Companies
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Load More Companies
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Companies;
