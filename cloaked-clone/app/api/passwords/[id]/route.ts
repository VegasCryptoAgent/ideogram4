import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/password-crypto'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await prisma.passwordEntry.deleteMany({
    where: { id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Plain metadata fields copied through as-is.
  const allowed = ['site', 'url', 'username', 'strength', 'hasTotp', 'tags', 'notes', 'breached']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  // Secrets must be encrypted at rest, exactly like POST /api/passwords.
  // Accept `password` (new) or `encryptedPassword` (legacy field name) as the plaintext.
  const plainPassword = body.password ?? body.encryptedPassword
  if (typeof plainPassword === 'string' && plainPassword.length > 0) {
    data.encryptedPassword = encrypt(plainPassword, session.user.id)
  }
  if (typeof body.totpSecret === 'string' && body.totpSecret.length > 0) {
    data.totpSecret = encrypt(body.totpSecret, session.user.id)
  }

  const entry = await prisma.passwordEntry.updateMany({
    where: { id, userId: session.user.id },
    data,
  })

  return NextResponse.json({ data: entry })
}
