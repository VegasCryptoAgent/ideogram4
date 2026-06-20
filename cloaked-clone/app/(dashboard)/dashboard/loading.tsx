function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function DashboardPageLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-1.5" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Privacy score circle + chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Privacy score */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-6 flex flex-col items-center">
          <Skeleton className="h-5 w-32 mb-6" />
          <Skeleton className="w-44 h-44 rounded-full mb-6" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Chart area */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/3 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-12 rounded-md" />
              <Skeleton className="h-7 w-12 rounded-md" />
              <Skeleton className="h-7 w-12 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
