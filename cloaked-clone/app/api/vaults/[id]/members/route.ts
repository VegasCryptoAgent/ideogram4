// ============================================================
// Shielded Privacy App — Shared Vault Members API
// POST   /api/vaults/[id]/members        → invite a member by email
// DELETE /api/vaults/[id]/members?email= → remove a member (owner only)
// ============================================================
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

const inviteSchema = z.object({ email: z.string().email() });

async function requireOwner(vaultId: string, userId: string) {
  const vault = await prisma.sharedVault.findUnique({
    where: { id: vaultId },
    select: { ownerId: true },
  });
  return vault && vault.ownerId === userId ? vault : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  if (!(await requireOwner(id, session.id))) {
    return errorResponse('Only the vault owner can invite members', 403);
  }

  const parsed = inviteSchema.safeParse(await req.json());
  if (!parsed.success) return errorResponse('A valid email is required', 400);
  const email = parsed.data.email.toLowerCase().trim();

  // Link to an existing account if one matches this email.
  const invitedUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  try {
    const member = await prisma.sharedVaultMember.create({
      data: { vaultId: id, email, userId: invitedUser?.id ?? null, role: 'member' },
      select: { id: true, email: true, role: true, userId: true },
    });
    return successResponse({ member });
  } catch {
    // Unique constraint (vaultId, email) — already a member.
    return errorResponse('That person is already a member of this vault', 409);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  if (!(await requireOwner(id, session.id))) {
    return errorResponse('Only the vault owner can remove members', 403);
  }

  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim();
  if (!email) return errorResponse('email query param required', 400);
  if (email === session.email) return errorResponse('The owner cannot be removed', 400);

  await prisma.sharedVaultMember.deleteMany({ where: { vaultId: id, email } });
  return successResponse({ removed: true });
}
