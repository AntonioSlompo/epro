const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  
  if (companies.length === 0) {
    console.log("Nenhuma empresa encontrada para vincular técnicos.");
    return;
  }

  const techniciansData = [
    { name: "Carlos Alberto", department: "Instalação", specialties: "Câmeras, Alarmes", mobile: "(11) 98888-7777" },
    { name: "Roberto Santos", department: "Manutenção", specialties: "Cerca Elétrica, CFTV", mobile: "(11) 97777-6666" },
    { name: "Ana Paula Silva", department: "Redes", specialties: "Fibra Óptica, Configuração Mikrotik", mobile: "(11) 96666-5555" },
    { name: "Marcos Oliveira", department: "Ti", specialties: "Servidores, Backup", mobile: "(11) 95555-4444" },
    { name: "Ricardo Ferreira", department: "Instalação", specialties: "Interfonia, PABX", mobile: "(11) 94444-3333" }
  ];

  for (const company of companies) {
    console.log(`Semeando técnicos para a empresa: ${company.name}`);
    for (const tech of techniciansData) {
      await prisma.technician.create({
        data: {
          ...tech,
          companyId: company.id,
          active: true
        }
      });
    }
  }

  console.log("Semeio de técnicos concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
