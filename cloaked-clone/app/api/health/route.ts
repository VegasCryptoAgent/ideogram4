import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  let dbStatus = 'unconfigured';

  if (dbUrl) {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'ok';
    } catch {
      dbStatus = 'error';
    }
  }

  return NextResponse.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
