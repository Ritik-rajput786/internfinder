// Loading Skeleton Component - shows placeholder while jobs are loading
const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Logo Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Badge Skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          </div>

          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>

          {/* Company Skeleton */}
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>

          {/* Location Skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Button Skeleton */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;

