const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTools() {
    console.log('--- Iniciando Geração de Ferramentas/Dispositivos ---');
    
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada.');
        return;
    }

    const toolCategories = [
        { name: 'Parafusadeira', brands: ['Makita', 'Bosch', 'DeWalt'], models: ['XDT13', 'GSB 18V-50', 'DCF887'] },
        { name: 'Furadeira de Impacto', brands: ['Bosch', 'DeWalt', 'Makita'], models: ['GBH 2-24 D', 'DCH273', 'HR2470'] },
        { name: 'Multímetro Digital', brands: ['Fluke', 'Minipa', 'Hikari'], models: ['117', 'ET-2042E', 'HM-2090'] },
        { name: 'Escada de Fibra', brands: ['Walsywa', 'Alulev'], models: ['Extensível 3.2m', 'Tesoura 7 Degraus'] },
        { name: 'Alicate Crimpador', brands: ['Proskit', 'Gedore'], models: ['CP-376K', 'Universal 8"'] },
        { name: 'Testador de Cabo', brands: ['Fluke', 'Hikari'], models: ['MicroScanner2', 'HT-150'] },
        { name: 'Notebook', brands: ['Dell', 'Lenovo', 'HP'], models: ['Vostro 3520', 'ThinkPad E14', 'ProBook 440'] },
        { name: 'Roteador Mikrotik', brands: ['Mikrotik'], models: ['RB750Gr3', 'RB3011UiAS-RM'] },
        { name: 'Nível Laser', brands: ['Bosam', 'DeWalt'], models: ['GLL 3-80 C', 'DW088K'] }
    ];

    const statuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];

    console.log(`Encontradas ${companies.length} empresas. Gerando 200 ferramentas para cada...`);

    for (const company of companies) {
        console.log(`Processando empresa: ${company.name}`);
        
        const toolsData = [];
        
        for (let i = 1; i <= 200; i++) {
            const cat = toolCategories[Math.floor(Math.random() * toolCategories.length)];
            const brand = cat.brands[Math.floor(Math.random() * cat.brands.length)];
            const model = cat.models[Math.floor(Math.random() * cat.models.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Gerar serial aleatório simples
            const serial = Math.random().toString(36).substring(2, 12).toUpperCase();

            toolsData.push({
                companyId: company.id,
                name: `${cat.name} ${i}`,
                category: cat.name,
                brand: brand,
                model: model,
                serialNumber: serial,
                status: status,
                active: true,
                notes: 'Equipamento gerado para testes de inventário.'
            });
        }

        const result = await prisma.tool.createMany({
            data: toolsData,
        });

        console.log(`  > Criadas ${result.count} ferramentas para ${company.name}`);
    }

    console.log('--- Geração Finalizada ---');
}

seedTools()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
