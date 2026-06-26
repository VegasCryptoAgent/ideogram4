// ============================================================
// WebAuthn registration — step 1: generate options
// POST /api/webauthn/register/options
// ============================================================
import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';
import { getRpConfig } from '@/lib/webauthn';

export async function POST(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const { rpName, rpID } = getRpConfig();

  const existing = await prisma.webAuthnCredential.findMany({
    where: { userId: session.id },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: session.id,
    userName: session.email,
    userDisplayName: session.name ?? session.email,
    attestationType: 'none',
    // Prevent registering the same authenticator twice.
    excludeCredentials: existing.map((c) => ({
      id: isoBase64URL.toBuffer(c.credentialId),
      type: 'public-key' as const,
      transports: (c.transports as AuthenticatorTransport[]) ?? undefined,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  // Stash the challenge so the verify step can confirm it.
  await prisma.user.update({
    where: { id: session.id },
    data: { webAuthnChallenge: options.challenge },
  });

  return successResponse(options);
}
