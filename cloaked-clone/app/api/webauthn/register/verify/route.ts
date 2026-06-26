// ============================================================
// WebAuthn registration — step 2: verify & store credential
// POST /api/webauthn/register/verify
// Body: { response: RegistrationResponseJSON, nickname?: string }
// ============================================================
import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';
import { getRpConfig } from '@/lib/webauthn';

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const body = await req.json().catch(() => null);
  if (!body?.response) return errorResponse('Missing registration response', 400);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { webAuthnChallenge: true },
  });
  if (!user?.webAuthnChallenge) {
    return errorResponse('No registration in progress. Start again.', 400);
  }

  const { rpID, origin } = getRpConfig();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch (err) {
    console.error('[WebAuthn] verify failed:', err);
    return errorResponse('Could not verify security key', 400);
  }

  if (!verification.verified || !verification.registrationInfo) {
    return errorResponse('Security key verification failed', 400);
  }

  const {
    credentialID,
    credentialPublicKey,
    counter,
    credentialDeviceType,
    credentialBackedUp,
  } = verification.registrationInfo;

  const credentialIdB64 = isoBase64URL.fromBuffer(credentialID);

  // Don't allow the same credential to be registered twice.
  const exists = await prisma.webAuthnCredential.findUnique({
    where: { credentialId: credentialIdB64 },
    select: { id: true },
  });
  if (exists) {
    await prisma.user.update({ where: { id: session.id }, data: { webAuthnChallenge: null } });
    return errorResponse('This security key is already registered', 409);
  }

  const transports: string[] = body.response.response?.transports ?? [];

  const credential = await prisma.webAuthnCredential.create({
    data: {
      userId: session.id,
      credentialId: credentialIdB64,
      publicKey: Buffer.from(credentialPublicKey),
      counter,
      transports,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      nickname: typeof body.nickname === 'string' && body.nickname.trim() ? body.nickname.trim() : null,
    },
    select: { id: true, nickname: true, deviceType: true, createdAt: true },
  });

  // Clear the one-time challenge.
  await prisma.user.update({ where: { id: session.id }, data: { webAuthnChallenge: null } });

  return successResponse({ credential });
}
