const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  
  if (companies.length === 0) {
    console.log("Nenhuma empresa encontrada para vincular ferramentas.");
    return;
  }

  const categories = ['Elétrica', 'Mecânica', 'Eletrônica', 'Redes', 'Pintura', 'Segurança', 'Diversos'];
  const brands = ['Bosch', 'Makita', 'Dewalt', 'Fluke', 'Intelbras', 'Hikvision', 'Furukawa', 'Vonder', 'Stanley', 'Gedore'];
  const toolNames = [
    'Parafusadeira', 'Furadeira de Impacto', 'Alicate Amperímetro', 'Testador de Rede RJ45', 
    'Escada Articulada 12 Degraus', 'Multímetro Digital', 'Serra Tico-Tico', 'Martelo Perfurador', 
    'Jogo de Chaves de Fenda', 'Nível Laser Autonivelante', 'Esmerilhadeira Angular', 'Lixadeira Orbital',
    'Trena a Laser', 'Alicate de Crimpar profissional', 'Detector de Tensão', 'Mala de Ferramentas com Rodas',
    'Lanterna LED Recarregável', 'EPI - Kit Proteção', 'Notebook para Configuração', 'Certificador de Rede'
  ];
  const statuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'LOST', 'DAMAGED'];

  for (const company of companies) {
    console.log(`Semeando 100 ferramentas para a empresa: ${company.name} (${company.id})`);
    
    const toolsToCreate = [];
    for (let i = 1; i <= 100; i++) {
        const nameIdx = Math.floor(Math.random() * toolNames.length);
        const brandIdx = Math.floor(Math.random() * brands.length);
        const catIdx = Math.floor(Math.random() * categories.length);
        const statusIdx = Math.floor(Math.random() * statuses.length);
        
        const toolName = toolNames[nameIdx];
        const brand = brands[brandIdx];
        const category = categories[catIdx];
        const status = statuses[statusIdx];
        
        toolsToCreate.push({
            companyId: company.id,
            name: `${toolName} #${i}`,
            serialNumber: `SN-${company.id.substring(0,4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
            brand: brand,
            model: `Mod-${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            category: category,
            status: status,
            notes: `Gerado automaticamente via script de semente.`,
            active: Math.random() > 0.1 // 90% active
        });
    }
    
    // Using createMany for performance if database supports it (SQLite doesn't support createMany in some versions but Prisma usually handles it)
    try {
        await prisma.tool.createMany({
            data: toolsToCreate
        });
    } catch (err) {
        console.log("createMany falhou ou não suportado, tentando inserção individual...");
        for (const tool of toolsToCreate) {
            await prisma.tool.create({ data: tool });
        }
    }
  }

  console.log("Semeio de ferramentas concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
