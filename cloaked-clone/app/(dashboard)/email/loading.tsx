function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function EmailLoading() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats row — 3 cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="w-7 h-7 rounded-md" />
            </div>
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Alias list header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Alias rows */}
      <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0"
          >
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-1.5" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
