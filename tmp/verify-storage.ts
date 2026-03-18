import { PrismaClient } from '@prisma/client';

async function list() {
  const prisma = new PrismaClient();
  const locs = await prisma.storageLocation.findMany({
    include: {
      company: { select: { name: true } }
    }
  });
  console.log(`Total Storage Locations: ${locs.length}`);
  locs.forEach(l => {
    console.log(`- [${l.company.name}] ${l.name} (${l.type})`);
  });
  await prisma.$disconnect();
}

list();
