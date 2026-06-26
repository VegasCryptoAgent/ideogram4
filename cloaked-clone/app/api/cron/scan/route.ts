import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runScanJob } from '@/lib/scan-processor'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // Fail closed — without a secret the auth check below would accept "Bearer undefined".
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Find users due for their periodic scan
  const users = await prisma.user.findMany({
    where: {
      onboardingDone: true,
      OR: [
        { lastScanAt: null },
        { AND: [{ planId: 'starter' }, { lastScanAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }] },
        { AND: [{ planId: 'pro' },     { lastScanAt: { lt: new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000) } }] },
        { AND: [{ planId: 'ultimate' },{ lastScanAt: { lt: new Date(now.getTime() -  1 * 24 * 60 * 60 * 1000) } }] },
      ],
    },
    select: { id: true },
  })

  // Create scan jobs and fire them inline (fire-and-forget)
  let triggered = 0
  for (const user of users) {
    try {
      const scanJob = await prisma.scanJob.create({
        data: { userId: user.id, status: 'pending' },
      })
      void runScanJob(user.id, scanJob.id)
      triggered++
    } catch {
      // skip users that already have a running job
    }
  }

  return NextResponse.json({ triggered, total: users.length, timestamp: now.toISOString() })
}
