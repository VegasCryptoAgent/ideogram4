import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateCard } from '@/lib/privacy-com'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: token } = await params

  const dbCard = await prisma.virtualCard.findFirst({
    where: { token, userId: session.user.id },
  })
  if (!dbCard) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  try {
    await updateCard(token, { state: 'CLOSED' })
    await prisma.virtualCard.delete({ where: { id: dbCard.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Cards DELETE]', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
