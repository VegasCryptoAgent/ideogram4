// ============================================================
// Shielded Privacy App — Shared Vault detail API
// DELETE /api/vaults/[id]          → delete a vault (owner only)
// POST   /api/vaults/[id]/members  → handled in members/route.ts
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const vault = await prisma.sharedVault.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!vault) return errorResponse('Vault not found', 404);
  if (vault.ownerId !== session.id) return errorResponse('Only the vault owner can delete it', 403);

  // Detach any passwords from the vault before deleting (keeps the entries).
  await prisma.passwordEntry.updateMany({
    where: { sharedVaultId: id },
    data: { sharedVaultId: null },
  });
  await prisma.sharedVault.delete({ where: { id } });

  return successResponse({ deleted: true });
}
