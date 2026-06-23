import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await prisma.breachAlert.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...(typeof body.isRead === 'boolean' ? { isRead: body.isRead } : {}),
    },
  })

  return NextResponse.json({ success: true })
}
