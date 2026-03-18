const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('Products:', count);
  const companies = await prisma.company.findMany({ select: { id: true, name: true, slug: true } });
  console.log('Companies:', companies);
}

main().catch(console.error).finally(() => prisma.$disconnect());
