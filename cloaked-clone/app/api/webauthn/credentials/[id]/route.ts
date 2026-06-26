// ============================================================
// WebAuthn — remove a registered security key / passkey
// DELETE /api/webauthn/credentials/[id]
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

  // Scope the delete to the owner so users can only remove their own keys.
  await prisma.webAuthnCredential.deleteMany({
    where: { id, userId: session.id },
  });

  return successResponse({ deleted: true });
}
