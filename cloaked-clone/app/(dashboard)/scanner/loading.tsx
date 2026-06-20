function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function ScannerLoading() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Scan button area */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-8 mb-6 flex flex-col items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-11 w-36 rounded-lg mt-2" />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Results table */}
      <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/5">
          {['Broker', 'Status', 'Last Checked', 'Action'].map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-20" />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 items-center px-5 py-4 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
