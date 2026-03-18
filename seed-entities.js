const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedEntities() {
    console.log('--- Inicando Geração de Entidades ---');
    
    // Buscar todas as empresas
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada para gerar entidades.');
        return;
    }

    console.log(`Encontradas ${companies.length} empresas. Gerando 100 entidades para cada...`);

    for (const company of companies) {
        console.log(`Processando empresa: ${company.name} (${company.id})`);
        
        const entitiesData = [];
        
        for (let i = 1; i <= 100; i++) {
            const isCustomer = Math.random() > 0.3; // 70% clientes
            const isSupplier = !isCustomer || Math.random() > 0.8; // Alguns podem ser ambos
            
            // Gerar CNPJ fake simples para evitar erro de unique se houver validação estrita
            // Formato: XX.XXX.XXX/0001-XX
            const cnpjBase = Math.floor(Math.random() * 90000000 + 10000000).toString();
            const cnpj = `${cnpjBase}0001${Math.floor(Math.random() * 90 + 10)}`;

            entitiesData.push({
                companyId: company.id,
                name: `Entidade Exemplo ${i} - ${company.name}`,
                tradeName: `Fantasia ${i}`,
                documentType: 'CNPJ',
                document: cnpj,
                isCustomer: isCustomer,
                isSupplier: isSupplier,
                active: true,
                email: `contato${i}@exemplo.com.br`,
                phone: '(11) 4002-8922',
                city: 'São Paulo',
                state: 'SP',
                zip: '01001-000'
            });
        }

        // Usar createMany para performance
        const result = await prisma.entity.createMany({
            data: entitiesData,
            skipDuplicates: true,
        });

        console.log(`  > Criadas ${result.count} entidades para ${company.name}`);
    }

    console.log('--- Geração Finalizada ---');
}

seedEntities()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
