const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedVehicles() {
    console.log('--- Iniciando Geração de Veículos ---');
    
    // Buscar todas as empresas
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada para gerar veículos.');
        return;
    }

    const vehicleModels = [
        { brand: 'Fiat', model: 'Fiorino', type: 'VAN' },
        { brand: 'Volkswagen', model: 'Gol', type: 'CAR' },
        { brand: 'Chevrolet', model: 'Onix', type: 'CAR' },
        { brand: 'Honda', model: 'CG 160', type: 'MOTORCYCLE' },
        { brand: 'Yamaha', model: 'Fazer 250', type: 'MOTORCYCLE' },
        { brand: 'Renault', model: 'Master', type: 'VAN' },
        { brand: 'Ford', model: 'Transit', type: 'VAN' },
        { brand: 'Toyota', model: 'Hilux', type: 'TRUCK' },
        { brand: 'Iveco', model: 'Daily', type: 'TRUCK' },
        { brand: 'Mercedes-Benz', model: 'Sprinter', type: 'VAN' }
    ];

    const colors = ['Branco', 'Prata', 'Preto', 'Cinza', 'Vermelho', 'Azul'];
    const fuelTypes = ['FLEX', 'GASOLINE', 'DIESEL', 'ELECTRIC'];

    console.log(`Encontradas ${companies.length} empresas. Gerando 10 veículos para cada...`);

    for (const company of companies) {
        console.log(`Processando empresa: ${company.name} (${company.id})`);
        
        const vehiclesData = [];
        
        for (let i = 1; i <= 10; i++) {
            const vBase = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const fuel = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
            
            // Gerar Placa aleatória (AAA-0A00 ou AAA-0000)
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const p1 = letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)] + letters[Math.floor(Math.random()*26)];
            const p2 = Math.floor(Math.random()*10).toString() + letters[Math.floor(Math.random()*26)] + Math.floor(Math.random()*10) + Math.floor(Math.random()*10);
            const plate = `${p1}-${p2}`;

            vehiclesData.push({
                companyId: company.id,
                plate: plate,
                brand: vBase.brand,
                model: vBase.model,
                type: vBase.type,
                color: color,
                yearManufacture: 2020 + Math.floor(Math.random() * 5),
                yearModel: 2020 + Math.floor(Math.random() * 6),
                status: 'AVAILABLE',
                fuelType: fuel,
                currentMileage: Math.floor(Math.random() * 50000),
                fleetNumber: `F-${100 + i}`
            });
        }

        const result = await prisma.vehicle.createMany({
            data: vehiclesData,
            skipDuplicates: true
        });

        console.log(`  > Criados ${result.count} veículos para ${company.name}`);
    }

    console.log('--- Geração Finalizada ---');
}

seedVehicles()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
