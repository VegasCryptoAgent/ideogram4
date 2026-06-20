import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // Verify this is called by Vercel cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find users due for scanning based on their plan
  const now = new Date()
  const users = await prisma.user.findMany({
    where: {
      onboardingDone: true,
      OR: [
        { lastScanAt: null },
        {
          AND: [
            { planId: 'starter' },
            { lastScanAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
          ]
        },
        {
          AND: [
            { planId: 'pro' },
            { lastScanAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
          ]
        },
        {
          AND: [
            { planId: 'ultimate' },
            { lastScanAt: { lt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) } }
          ]
        },
      ]
    },
    select: { id: true }
  })

  // Create scan jobs for due users
  const jobs = await Promise.allSettled(
    users.map(user =>
      prisma.scanJob.create({
        data: { userId: user.id, status: 'pending' }
      })
    )
  )

  const created = jobs.filter(j => j.status === 'fulfilled').length

  return NextResponse.json({
    triggered: created,
    total: users.length,
    timestamp: now.toISOString()
  })
}
