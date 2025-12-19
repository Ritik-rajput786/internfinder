// CompanyCard Component - displays a single company with job count
import { useNavigate } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  const navigate = useNavigate();

  // Get company initial for logo
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

  // Handle View Jobs button click
  const handleViewJobs = () => {
    // Navigate to jobs page with company filter
    navigate(`/jobs?company=${encodeURIComponent(company.name)}`);
  };

  const gradientColor = getGradientColor(getCompanyInitial(company.name));

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
      <div className="flex flex-col">
        {/* Company Logo */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center shadow-md`}>
            <span className="text-2xl font-bold text-white">
              {getCompanyInitial(company.name)}
            </span>
          </div>
          {/* Job Count Badge */}
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
          </div>
        </div>

        {/* Company Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          {company.name}
        </h3>

        {/* Industry Badge */}
        {company.industry && (
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              {company.industry}
            </span>
            {company.isVerified && (
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Verified Indian Company</span>
            )}
            <span className="inline-block px-2 py-0.5 bg-white border text-gray-600 rounded text-xs">🇮🇳 India</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-gray-500 mb-4">
          <svg
            className="w-4 h-4 mr-2"
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
          <span className="text-sm">{company.city || company.location || 'Location not specified'}</span>
        </div>

        {/* View Jobs Button */}
        <button
          onClick={handleViewJobs}
          className="w-full py-2.5 px-4 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          View Jobs →
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
