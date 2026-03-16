const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`Total products in database: ${count}`);
}

main().finally(() => prisma.$disconnect());
