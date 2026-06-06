// ============================================================
// Shielded Privacy App — Privacy Score API
// GET /api/user/privacy-score → calculate and return score
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePrivacyScore } from '@/services/privacy-score';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const [brokerRecords, breachCount] = await Promise.all([
      prisma.brokerRecord.findMany({
        where: { userId: session.id },
        include: { broker: { select: { category: true, name: true } } },
      }),
      prisma.breachAlert.count({ where: { userId: session.id, isRead: false } }),
    ]);

    const hasBreaches = breachCount > 0;
    const result = calculatePrivacyScore(brokerRecords, hasBreaches);

    // Persist updated score to user record
    await prisma.user.update({
      where: { id: session.id },
      data: { privacyScore: result.score },
    });

    return successResponse({
      score: result.score,
      category: result.category,
      breakdown: result.breakdown,
      recommendations: result.recommendations,
      stats: {
        ...result.stats,
        unresolvedBreaches: breachCount,
      },
    });
  } catch (err) {
    console.error('[PrivacyScore GET]', err);
    return errorResponse('Failed to calculate privacy score', 500);
  }
}
