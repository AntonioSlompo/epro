import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      vehicles: {
        where: {
          storageLocation: null
        }
      }
    }
  });

  console.log(`Found ${companies.length} companies.`);

  for (const company of companies) {
    console.log(`Generating 6 storage locations for company: ${company.name} (${company.id})`);

    const locations = [
      // 2 FIXED
      {
        name: 'Almoxarifado Central',
        type: 'FIXED' as const,
        status: 'ACTIVE' as const,
        zip: '01001-000',
        street: 'Praça da Sé',
        number: '100',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
      },
      {
        name: 'Depósito Auxiliar',
        type: 'FIXED' as const,
        status: 'ACTIVE' as const,
        zip: '04571-010',
        street: 'Avenida das Nações Unidas',
        number: '12551',
        neighborhood: 'Brooklin Paulista',
        city: 'São Paulo',
        state: 'SP',
      },
      // 2 MOBILE
      {
        name: 'Unidade Móvel 01',
        type: 'MOBILE' as const,
        status: 'ACTIVE' as const,
        vehicleId: company.vehicles[0]?.id || null,
      },
      {
        name: 'Unidade Móvel 02',
        type: 'MOBILE' as const,
        status: 'BLOCKED_MOVEMENT' as const,
        vehicleId: company.vehicles[1]?.id || null,
      },
      // 2 VIRTUAL
      {
        name: 'Estoque Virtual - Nuvem',
        type: 'VIRTUAL' as const,
        status: 'ACTIVE' as const,
      },
      {
        name: 'Estoque em Trânsito',
        type: 'VIRTUAL' as const,
        status: 'INACTIVE' as const,
      },
    ];

    for (const loc of locations) {
      await prisma.storageLocation.create({
        data: {
          ...loc,
          companyId: company.id,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
