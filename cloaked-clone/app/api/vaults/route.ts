// ============================================================
// Shielded Privacy App — Shared Vaults API
// GET  /api/vaults  → list vaults the user owns or belongs to
// POST /api/vaults  → create a vault (optionally invite one member)
// ============================================================
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, successResponse, errorResponse, createdResponse } from '@/lib/api-helpers';

const createSchema = z.object({
  name: z.string().min(1).max(80),
  inviteEmail: z.string().email().optional().or(z.literal('')),
});

export async function GET(): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  // Vaults the user owns, plus vaults they've been added to as a member.
  const vaults = await prisma.sharedVault.findMany({
    where: {
      OR: [
        { ownerId: session.id },
        { members: { some: { OR: [{ userId: session.id }, { email: session.email }] } } },
      ],
    },
    include: {
      members: { select: { id: true, email: true, role: true, userId: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = vaults.map((v) => ({
    id: v.id,
    name: v.name,
    isOwner: v.ownerId === session.id,
    memberCount: v.members.length,
    itemCount: v._count.entries,
    members: v.members,
    createdAt: v.createdAt,
  }));

  return successResponse({ vaults: data });
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getAuthenticatedUser();
  if (!session) return errorResponse('Unauthorized', 401);

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return errorResponse('Invalid vault details', 400);

  const { name, inviteEmail } = parsed.data;

  const vault = await prisma.sharedVault.create({
    data: {
      ownerId: session.id,
      name: name.trim(),
      members: {
        create: [
          // The creator is always a member with the owner role.
          { email: session.email, userId: session.id, role: 'owner' },
          // Optionally invite one person at creation time.
          ...(inviteEmail
            ? [{ email: inviteEmail.toLowerCase().trim(), role: 'member' }]
            : []),
        ],
      },
    },
    include: {
      members: { select: { id: true, email: true, role: true, userId: true } },
      _count: { select: { entries: true } },
    },
  });

  return createdResponse({
    vault: {
      id: vault.id,
      name: vault.name,
      isOwner: true,
      memberCount: vault.members.length,
      itemCount: vault._count.entries,
      members: vault.members,
      createdAt: vault.createdAt,
    },
  });
}
