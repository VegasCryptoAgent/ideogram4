'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Alert icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-red-500/5 blur-xl" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        {/* Subtext */}
        <p className="text-white/50 mb-5 leading-relaxed">
          An unexpected error occurred. You can try again or return home.
        </p>

        {/* Error message */}
        {error.message && (
          <div className="mb-8 text-left">
            <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">
              Error details
            </p>
            <code className="block w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-red-300 font-mono break-all">
              {error.message}
            </code>
            {error.digest && (
              <p className="text-xs text-white/20 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-medium px-6"
          >
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-6"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
