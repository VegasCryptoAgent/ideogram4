// GET /api/autocloak → list user's site settings
// PUT /api/autocloak → bulk update site settings
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers';

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const settings = await prisma.autoCloakSetting.findMany({
      where: { userId: session.id },
      select: { site: true, enabled: true, alias: true },
    });
    return successResponse({ settings });
  } catch (err) {
    console.error('[AutoCloak GET]', err);
    return errorResponse('Failed to fetch autocloak settings', 500);
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  try {
    const { site, enabled } = await req.json();
    if (!site) return errorResponse('site required', 400);

    const setting = await prisma.autoCloakSetting.upsert({
      where: { userId_site: { userId: session.id, site } },
      update: { enabled },
      create: { userId: session.id, site, enabled },
    });

    return successResponse(setting);
  } catch (err) {
    console.error('[AutoCloak PUT]', err);
    return errorResponse('Failed to update autocloak setting', 500);
  }
}
