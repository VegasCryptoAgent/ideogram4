function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function PhoneLoading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Add number button */}
      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Phone number cards */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div>
                  <Skeleton className="h-5 w-36 mb-2" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-md" />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="text-center">
                  <Skeleton className="h-5 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
