// ============================================================
// Shielded Privacy App — Spam Stats API
// GET /api/spam/stats → spam blocking statistics
// ============================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    // Get all virtual phones for user
    const phones = await prisma.virtualPhone.findMany({
      where: { userId: session.id },
      select: { id: true, number: true, spamBlocked: true, callsReceived: true, smsReceived: true },
    });

    // Get all email aliases
    const aliases = await prisma.emailAlias.findMany({
      where: { userId: session.id },
      select: { id: true, alias: true, spamBlocked: true, emailsReceived: true },
    });

    // Aggregate phone spam stats
    const totalSpamCallsBlocked = phones.reduce((sum, p) => sum + p.spamBlocked, 0);
    const totalCallsReceived = phones.reduce((sum, p) => sum + p.callsReceived, 0);

    // Aggregate email spam stats
    const totalSpamEmailsBlocked = aliases.reduce((sum, a) => sum + a.spamBlocked, 0);
    const totalEmailsReceived = aliases.reduce((sum, a) => sum + a.emailsReceived, 0);

    // Recent blocked calls (from call logs)
    const recentBlockedCalls = await prisma.callLog.findMany({
      where: {
        virtualPhone: { userId: session.id },
        isSpam: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        virtualPhone: { select: { number: true, label: true } },
      },
    });

    const phoneIds = phones.map((p) => p.id);

    // Spam by virtual phone breakdown
    const phoneBreakdown = phones.map((phone) => ({
      phoneId: phone.id,
      number: phone.number,
      spamBlocked: phone.spamBlocked,
      callsReceived: phone.callsReceived,
      blockRate:
        phone.callsReceived > 0
          ? Math.round((phone.spamBlocked / phone.callsReceived) * 100)
          : 0,
    }));

    // Spam by email alias breakdown
    const aliasBreakdown = aliases.map((alias) => ({
      aliasId: alias.id,
      alias: alias.alias,
      spamBlocked: alias.spamBlocked,
      emailsReceived: alias.emailsReceived,
      blockRate:
        alias.emailsReceived > 0
          ? Math.round((alias.spamBlocked / alias.emailsReceived) * 100)
          : 0,
    }));

    return successResponse({
      summary: {
        totalSpamCallsBlocked,
        totalSpamEmailsBlocked,
        totalBlocked: totalSpamCallsBlocked + totalSpamEmailsBlocked,
        totalCallsReceived,
        totalEmailsReceived,
        callBlockRate:
          totalCallsReceived > 0
            ? Math.round((totalSpamCallsBlocked / totalCallsReceived) * 100)
            : 0,
        emailBlockRate:
          totalEmailsReceived > 0
            ? Math.round((totalSpamEmailsBlocked / totalEmailsReceived) * 100)
            : 0,
      },
      recentBlocked: {
        calls: recentBlockedCalls.map((log) => ({
          id: log.id,
          from: log.from,
          spamScore: log.spamScore,
          createdAt: log.createdAt,
          virtualPhone: log.virtualPhone,
        })),
      },
      phoneBreakdown,
      aliasBreakdown,
    });
  } catch (err) {
    console.error('[Spam Stats GET]', err);
    return errorResponse('Failed to fetch spam stats', 500);
  }
}
