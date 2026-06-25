// ============================================================
// Shielded Privacy App — Reset Password API
// POST /api/auth/reset-password → verify token and update password
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errorResponse('Invalid request', 400);

  const { token, newPassword } = parsed.data;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (payload['purpose'] !== 'password-reset' || !payload.sub) {
      return errorResponse('Invalid or expired reset link', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { hashedPassword: hashed },
    });

    return successResponse({ message: 'Password reset successfully. You can now sign in.' });
  } catch {
    return errorResponse('Invalid or expired reset link. Please request a new one.', 400);
  }
}
