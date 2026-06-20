function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`} />
  )
}

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="w-64 shrink-0 border-r border-white/5 p-5 flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="w-24 h-5" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="w-4 h-4 shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>

        {/* Bottom user area */}
        <div className="mt-auto flex items-center gap-3 px-3 py-3 rounded-lg bg-white/3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 overflow-auto p-8">
        {/* Page header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/3 p-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Large content block */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}
