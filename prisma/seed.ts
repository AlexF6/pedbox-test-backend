// backend/prisma/seed.ts
import { syncCharacters } from '../src/services/sync.service';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('[Seed] Starting automatic database seeding...');
  
  const result = await syncCharacters();
  
  console.log('[Seed] Seeding process completed successfully.');
  console.log(`Summary:
   - Synced characters: ${result.synced}
   - Synced episodes: ${result.episodes}
   - Created relationships: ${result.relationships}
  `);
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });