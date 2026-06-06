/**
 * Seed script — populates the DataBroker table with the master broker list.
 *
 * Usage:
 *   npx tsx scripts/seed-brokers.ts
 *   # or via package.json script:
 *   npm run db:seed
 *
 * The script uses Prisma `upsert` keyed on `website` so it is safe to re-run
 * at any time without creating duplicates.
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

  for (const broker of BROKERS) {
    const result = await prisma.dataBroker.upsert({
      where: { website: broker.website } as { website: string },
      create: {
        name: broker.name,
        website: broker.website,
        category: broker.category,
        optOutMethod: broker.optOutMethod,
        optOutUrl: broker.optOutUrl ?? null,
        optOutEmail: (broker as { optOutEmail?: string }).optOutEmail ?? null,
        scanUrlTemplate: broker.scanUrlTemplate ?? null,
        difficulty: broker.difficulty,
        avgRemovalDays: broker.avgRemovalDays,
        priority: broker.priority,
        isActive: broker.isActive ?? true,
      },
      update: {
        name: broker.name,
        category: broker.category,
        optOutMethod: broker.optOutMethod,
        optOutUrl: broker.optOutUrl ?? null,
        optOutEmail: (broker as { optOutEmail?: string }).optOutEmail ?? null,
        scanUrlTemplate: broker.scanUrlTemplate ?? null,
        difficulty: broker.difficulty,
        avgRemovalDays: broker.avgRemovalDays,
        priority: broker.priority,
        isActive: broker.isActive ?? true,
      },
    });

    // Prisma upsert doesn't expose whether it created or updated, so we track
    // by comparing createdAt / updatedAt.
    const wasCreated =
      result.createdAt.getTime() === result.updatedAt.getTime() ||
      Date.now() - result.createdAt.getTime() < 5_000;

    if (wasCreated) {
      created++;
    } else {
      updated++;
    }

    process.stdout.write('.');
  }

  console.log(`\n[Seed] Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch((err) => {
    console.error('[Seed] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
