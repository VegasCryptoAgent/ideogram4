'use client'

import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Shield icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/20">
              <ShieldX className="w-12 h-12 text-violet-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-violet-500/5 blur-xl" />
          </div>
        </div>

        {/* 404 number */}
        <h1 className="text-8xl font-black mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-600 bg-clip-text text-transparent leading-none">
          404
        </h1>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h2>

        {/* Subtext */}
        <p className="text-white/50 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-medium px-6"
          >
            <Link href="/">Go Home</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-6"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
