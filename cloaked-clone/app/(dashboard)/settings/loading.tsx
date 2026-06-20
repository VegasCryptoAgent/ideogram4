function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function SettingsLoading() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-9 rounded-t-md mb-[-1px] ${
              i === 0 ? 'w-20' : i === 1 ? 'w-24' : i === 2 ? 'w-20' : 'w-28'
            }`}
          />
        ))}
      </div>

      {/* Form section */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-6 mb-6">
        <Skeleton className="h-5 w-36 mb-6" />

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3.5 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <Skeleton className="h-3.5 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Phone */}
          <div>
            <Skeleton className="h-3.5 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Bio / text area */}
          <div>
            <Skeleton className="h-3.5 w-16 mb-2" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Toggle settings section */}
      <div className="rounded-xl border border-white/5 bg-white/3 p-6">
        <Skeleton className="h-5 w-44 mb-6" />

        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div>
                <Skeleton className="h-4 w-40 mb-1.5" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="w-10 h-5 rounded-full shrink-0 ml-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  )
}
