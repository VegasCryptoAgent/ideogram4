// ============================================================
// Shielded Privacy App — Change Password API
// PATCH /api/user/password → verify current password and set new one
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse, handleZodError } from '@/lib/api-helpers';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { hashedPassword: true },
    });

    if (!user) return errorResponse('User not found', 404);

    if (!user.hashedPassword) {
      return errorResponse('Account uses OAuth sign-in — password change not available', 400);
    }

    const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!valid) return errorResponse('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.id },
      data: { hashedPassword: hashed },
    });

    return successResponse({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Password PATCH]', err);
    return errorResponse('Failed to update password', 500);
  }
}
