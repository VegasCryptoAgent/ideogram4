import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.passwordEntry.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const allowed = ['site', 'url', 'username', 'encryptedPassword', 'strength', 'hasTotp', 'totpSecret', 'tags', 'notes', 'breached']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const entry = await prisma.passwordEntry.updateMany({
    where: { id: params.id, userId: session.user.id },
    data,
  })

  return NextResponse.json({ data: entry })
}
