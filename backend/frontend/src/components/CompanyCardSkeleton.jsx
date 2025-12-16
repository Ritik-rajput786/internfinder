// Loading Skeleton Component for Company Cards
const CompanyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
      <div className="flex flex-col">
        {/* Logo and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
          <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Company Name */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        
        {/* Industry Badge */}
        <div className="h-6 w-20 bg-gray-300 rounded-full mb-3"></div>
        
        {/* Location */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        
        {/* Button */}
        <div className="h-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default CompanyCardSkeleton;
