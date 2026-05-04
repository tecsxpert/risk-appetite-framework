export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 py-4 px-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white p-6 rounded-lg shadow">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-white p-6 rounded-lg shadow">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse bg-white p-6 rounded-lg shadow space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-24 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}