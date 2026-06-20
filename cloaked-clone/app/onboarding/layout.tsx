import { Shield } from 'lucide-react'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-violet-500" />
          <span className="font-bold text-white text-lg">Shielded</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}
