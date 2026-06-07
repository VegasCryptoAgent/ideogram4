/**
 * Seed script — populates the DataBroker table with the master broker list.
 *
 * Usage:
 *   npx tsx scripts/seed-brokers.ts
 *   # or via package.json script:
 *   npm run db:seed
 *
 * Uses findFirst + create/update to be idempotent without requiring a
 * @unique constraint on DataBroker.website in the Prisma schema.
 */

import { PrismaClient } from '@prisma/client';
import { BROKERS } from '../data/brokers';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main(): Promise<void> {
  console.log(`[Seed] Seeding ${BROKERS.length} data brokers…`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const broker of BROKERS) {
    try {
      const existing = await prisma.dataBroker.findFirst({
        where: { website: broker.website },
        select: { id: true },
      });

      const payload = {
        name: broker.name,
        category: broker.category as string,
        optOutMethod: broker.optOutMethod as string,
        optOutUrl: broker.optOutUrl ?? null,
        optOutEmail: (broker as { optOutEmail?: string }).optOutEmail ?? null,
        scanUrlTemplate: broker.scanUrlTemplate ?? null,
        difficulty: broker.difficulty as string,
        avgRemovalDays: broker.avgRemovalDays,
        priority: broker.priority,
        isActive: true, // all seeded brokers are active by default
      };

      if (existing) {
        await prisma.dataBroker.update({
          where: { id: existing.id },
          data: payload,
        });
        updated++;
      } else {
        await prisma.dataBroker.create({
          data: { website: broker.website, ...payload },
        });
        created++;
      }

      process.stdout.write('.');
    } catch (err) {
      console.error(`\n[Seed] Failed to seed "${broker.name}":`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\n[Seed] Done. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error('[Seed] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
