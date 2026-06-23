import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: fetch stored breach alerts for user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const alerts = await prisma.breachAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: alerts })
}

// POST: trigger HIBP scan for user's email
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  })
  if (!user?.email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  const hibpKey = process.env.HIBP_API_KEY

  if (!hibpKey) {
    // Return existing stored alerts if no API key
    const existing = await prisma.breachAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      data: existing,
      message: 'Using cached data. Set HIBP_API_KEY for live scanning.',
    })
  }

  try {
    const res = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(user.email)}?truncateResponse=false`,
      {
        headers: {
          'hibp-api-key': hibpKey,
          'User-Agent': 'Shield-Privacy-App',
        },
      }
    )

    if (res.status === 404) {
      // No breaches found - delete existing alerts (clean slate)
      await prisma.breachAlert.deleteMany({ where: { userId: session.user.id } })
      return NextResponse.json({ data: [], message: 'No breaches found' })
    }

    if (!res.ok) throw new Error(`HIBP error: ${res.status}`)

    const breaches: any[] = await res.json()

    // Upsert each breach: findFirst + create/update since no unique constraint
    const upserted = await Promise.all(
      breaches.map(async (breach) => {
        const existing = await prisma.breachAlert.findFirst({
          where: {
            userId: session.user!.id!,
            breachName: breach.Name,
          },
        })

        if (existing) {
          return prisma.breachAlert.update({
            where: { id: existing.id },
            data: {
              dataExposed: breach.DataClasses || [],
              breachDate: breach.BreachDate ? new Date(breach.BreachDate) : null,
            },
          })
        }

        return prisma.breachAlert.create({
          data: {
            userId: session.user!.id!,
            breachName: breach.Name,
            breachDate: breach.BreachDate ? new Date(breach.BreachDate) : null,
            dataExposed: breach.DataClasses || [],
            sourceUrl: `https://haveibeenpwned.com/PwnedWebsites#${breach.Name}`,
            isRead: false,
          },
        })
      })
    )

    return NextResponse.json({ data: upserted })
  } catch (err: any) {
    console.error('HIBP error:', err)
    const existing = await prisma.breachAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: existing, error: err.message })
  }
}
