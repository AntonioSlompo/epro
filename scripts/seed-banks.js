const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BANKS = [
  {
    code: '001',
    name: 'Banco do Brasil S.A.',
    nickname: 'Banco do Brasil',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Banco_do_Brasil_Logo.svg/200px-Banco_do_Brasil_Logo.svg.png',
  },
  {
    code: '237',
    name: 'Banco Bradesco S.A.',
    nickname: 'Bradesco',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bradesco_logo.svg/200px-Bradesco_logo.svg.png',
  },
  {
    code: '341',
    name: 'Itaú Unibanco S.A.',
    nickname: 'Itaú',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ita%C3%BA_Unibanco_logo_2023.svg/200px-Ita%C3%BA_Unibanco_logo_2023.svg.png',
  },
  {
    code: '033',
    name: 'Banco Santander (Brasil) S.A.',
    nickname: 'Santander',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Santander_logo.svg/200px-Santander_logo.svg.png',
  },
];

async function main() {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  console.log(`Found ${companies.length} companies.`);

  for (const company of companies) {
    console.log(`Registering banks for company: ${company.name} (${company.id})`);
    for (const bank of BANKS) {
      await prisma.bank.upsert({
        where: {
          companyId_code: {
            companyId: company.id,
            code: bank.code,
          },
        },
        update: {
          name: bank.name,
          nickname: bank.nickname,
          logo: bank.logo,
          active: true,
        },
        create: {
          companyId: company.id,
          code: bank.code,
          name: bank.name,
          nickname: bank.nickname,
          logo: bank.logo,
          active: true,
        },
      });
    }
  }

  console.log('Finished registering banks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
