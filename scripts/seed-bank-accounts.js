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
    console.log(`Working on company: ${company.name} (${company.id})`);

    for (const bankInfo of BANKS) {
      // 1. Ensure the bank exists for this company
      const bank = await prisma.bank.upsert({
        where: {
          companyId_code: {
            companyId: company.id,
            code: bankInfo.code,
          },
        },
        update: {},
        create: {
          companyId: company.id,
          code: bankInfo.code,
          name: bankInfo.name,
          nickname: bankInfo.nickname,
          logo: bankInfo.logo,
        },
      });

      // 2. Check if a bank account already exists for this bank in this company
      // (Simplified: we'll just create a new one if not present, or maybe just one per bank)
      const existingAccount = await prisma.bankAccount.findFirst({
        where: {
          companyId: company.id,
          bankId: bank.id,
        },
      });

      if (!existingAccount) {
        const agency = Math.floor(1000 + Math.random() * 9000).toString();
        const accountNumber = Math.floor(100000 + Math.random() * 900000).toString() + '-' + Math.floor(Math.random() * 10);
        
        await prisma.bankAccount.create({
          data: {
            companyId: company.id,
            bankId: bank.id,
            agency: agency,
            number: accountNumber,
            type: 'Conta Corrente',
            openingDate: new Date(),
            active: true,
          },
        });
        console.log(`  - Created account for ${bank.nickname} (${agency} / ${accountNumber})`);
      } else {
        console.log(`  - Account already exists for ${bank.nickname}`);
      }
    }
  }

  console.log('Finished seeding bank accounts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
