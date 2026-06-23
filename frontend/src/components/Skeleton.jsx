const Skeleton = ({ className = '', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
  ));
  return count === 1 ? items[0] : <div className="space-y-3">{items}</div>;
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-32" />
    ))}
  </div>
);

export default Skeleton;
