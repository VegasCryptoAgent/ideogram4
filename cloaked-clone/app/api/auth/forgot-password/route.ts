// ============================================================
// Shielded Privacy App — Forgot Password API
// POST /api/auth/forgot-password → send password reset email
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  // Always return 200 to prevent email enumeration
  const ok = NextResponse.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });

  if (!parsed.success) return ok;

  try {
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, hashedPassword: true },
    });

    // Only send if user exists and uses password auth (not OAuth-only)
    if (!user?.hashedPassword) return ok;

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT({ purpose: 'password-reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(secret);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://shielded.app').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@shielded.app',
      to: email,
      subject: 'Reset your Shield password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin-bottom:8px">Reset your password</h2>
          <p>Hi ${user.firstName ?? 'there'},</p>
          <p>Click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}"
               style="background:#7C3AED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              Reset Password
            </a>
          </div>
          <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
          <p style="color:#666;font-size:13px">Or copy this link: ${resetUrl}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[ForgotPassword POST]', err);
    // Silently swallow — still return 200 to prevent enumeration
  }

  return ok;
}
