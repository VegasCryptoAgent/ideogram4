import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  site: z.string().min(1),
  url: z.string().optional(),
  username: z.string().min(1),
  encryptedPassword: z.string().min(1),
  strength: z.enum(['weak', 'medium', 'strong']).default('medium'),
  hasTotp: z.boolean().default(false),
  totpSecret: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = await prisma.passwordEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ data: entries })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const entry = await prisma.passwordEntry.create({
    data: { userId: session.user.id, ...parsed.data },
  })

  return NextResponse.json({ data: entry }, { status: 201 })
}
