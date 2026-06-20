function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function BreachLoading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Check button area */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-8 mb-8 flex flex-col items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-3 mt-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Breach alert cards */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-full mb-1.5" />
                <Skeleton className="h-3.5 w-4/5 mb-4" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16 rounded-md" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-3 w-20 shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
