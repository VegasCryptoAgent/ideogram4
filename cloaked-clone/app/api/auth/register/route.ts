import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { scannerQueue } from '@/lib/queues';
import { errorResponse, createdResponse, handleZodError } from '@/lib/api-helpers';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date of birth').optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    const { email, password, firstName, lastName, dateOfBirth, phone } = parsed.data;

    let existing;
    try {
      existing = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error('[Register] DB lookup failed:', dbErr);
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      return errorResponse(`Database error: ${msg}`, 500);
    }
    if (existing) {
      return errorResponse('An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let stripeCustomerId: string | undefined;
    try {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: { source: 'shielded-registration' },
      });
      stripeCustomerId = customer.id;
    } catch (stripeErr) {
      console.error('[Register] Stripe customer creation failed:', stripeErr);
    }

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        realPhones: phone ? [phone] : [],
        stripeCustomerId,
        spamSettings: {
          create: {
            blockUnknownCallers: false,
            blockRobocalls: true,
            spamSensitivity: 'medium',
            whitelist: [],
            blacklist: [],
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        dateOfBirth: true,
        realPhones: true,
        createdAt: true,
        privacyScore: true,
        onboardingDone: true,
        stripeCustomerId: true,
      },
    });

    try {
      const scanJob = await prisma.scanJob.create({
        data: {
          userId: user.id,
          status: 'pending',
        },
      });

      await scannerQueue.add(
        'initial-scan',
        { userId: user.id, scanJobId: scanJob.id },
        { jobId: `initial-scan-${user.id}`, delay: 5000 }
      );
    } catch (queueErr) {
      console.error('[Register] Failed to trigger initial scan:', queueErr);
    }

    return createdResponse({
      user,
      message: 'Account created successfully. Your initial scan has been queued.',
    });
  } catch (err) {
    console.error('[Register] Unexpected error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return errorResponse(`Failed to create account: ${msg}`, 500);
  }
}
