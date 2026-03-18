const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProducts() {
    console.log('--- Inicando Geração de Produtos/Serviços ---');
    
    // Buscar todas as empresas
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada para gerar produtos.');
        return;
    }

    const categories = {
        'PHYSICAL': ['EQUIPMENT'],
        'SERVICE_ONETIME': ['INSTALLATION', 'MAINTENANCE'],
        'SERVICE_RECURRING': ['MONITORING', 'SOFTWARE_LICENSE'],
    };

    const productNames = {
        'EQUIPMENT': [
            'Câmera Dome Full HD', 'Câmera Bullet 4K', 'Central de Alarme 8 Zonas', 
            'Sensor Infravermelho Passivo', 'Sirene de Alta Potência', 'Bateria Selada 12V 7Ah',
            'Cabo Coaxial Flexível (100m)', 'Conector BNC com Mola', 'Fonte de Alimentação 12V 10A',
            'Gravador DVR 8 Canais', 'HD 1TB SkyHawk', 'Interfone Residencial',
            'Fechadura Eletrônica Digital', 'Controle Remoto 433MHz', 'Modulo de Choque'
        ],
        'INSTALLATION': [
            'Instalação de Ponto de Câmera', 'Instalação de Central de Alarme', 'Configuração de Acesso Remoto',
            'Passagem de Cabeamento (Metro)', 'Montagem de Rack 19"', 'Instalação de Fechadura Digital'
        ],
        'MAINTENANCE': [
            'Visita Técnica Corretiva', 'Limpeza e Ajuste de Câmeras', 'Troca de Baterias do Sistema',
            'Reparo de Cabeamento Danificado', 'Atualização de Firmware DVR/NVR'
        ],
        'MONITORING': [
            'Monitoramento de Alarme Residencial', 'Monitoramento Comercial 24h', 'Apoio Tático em Eventos',
            'Relatório Diário de Eventos', 'Rastreamento Veicular Mensal'
        ],
        'SOFTWARE_LICENSE': [
            'Licença Software de Gestão VMS (Canal)', 'App de Notificações Mobile', 'Backup em Nuvem 30 Dias'
        ]
    };

    const units = ['UN', 'MT', 'HR', 'KIT'];

    console.log(`Encontradas ${companies.length} empresas. Gerando 200 registros de Produtos/Serviços para cada...`);

    for (const company of companies) {
        console.log(`Processando empresa: ${company.name} (${company.id})`);
        
        const productsData = [];
        
        for (let i = 1; i <= 200; i++) {
            // Distribuir entre os tipos (mais ou menos balanceado)
            const typeKeys = Object.keys(categories);
            const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
            
            const categoryKeys = categories[type];
            const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            
            const names = productNames[category];
            const baseName = names[Math.floor(Math.random() * names.length)];
            
            const name = `${baseName} ${i}`;
            const sku = `${type.substring(0, 1)}${category.substring(0, 1)}-${i.toString().padStart(4, '0')}`;
            
            const isRecurring = type === 'SERVICE_RECURRING';
            
            productsData.push({
                companyId: company.id,
                name: name,
                sku: sku,
                type: type,
                category: category,
                status: 'ACTIVE',
                description: `Descrição detalhada do item ${name} para a empresa ${company.name}.`,
                isRecurring: isRecurring,
                unitOfMeasure: i % 10 === 0 ? 'KIT' : (type === 'PHYSICAL' ? 'UN' : 'HR'),
                suggestedSellingPrice: (Math.random() * 500 + 50).toFixed(2),
                averageCost: (Math.random() * 300 + 20).toFixed(2),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // Usar createMany para performance
        const result = await prisma.product.createMany({
            data: productsData,
            skipDuplicates: true, // Garante que se rodar de novo não dá erro se SKU bater
        });

        console.log(`  > Criados ${result.count} registros para ${company.name}`);
    }

    console.log('--- Geração Finalizada ---');
}

seedProducts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
