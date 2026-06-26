// ============================================================
// WebAuthn — list a user's registered security keys / passkeys
// GET /api/webauthn/credentials
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId: session.id },
    select: {
      id: true,
      nickname: true,
      deviceType: true,
      backedUp: true,
      transports: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ credentials });
}
