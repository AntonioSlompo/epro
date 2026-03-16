const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true } });
  if (companies.length === 0) {
    console.log("No companies found.");
    return;
  }

  const vehiclesData = [
    { brand: "Fiat", model: "Strada", type: "CAR", fuelType: "FLEX" },
    { brand: "Fiat", model: "Fiorino", type: "VAN", fuelType: "FLEX" },
    { brand: "Chevrolet", model: "Onix", type: "CAR", fuelType: "FLEX" },
    { brand: "Chevrolet", model: "S10", type: "TRUCK", fuelType: "DIESEL" },
    { brand: "VW", model: "Saveiro", type: "CAR", fuelType: "FLEX" },
    { brand: "VW", model: "Gol", type: "CAR", fuelType: "FLEX" },
    { brand: "Honda", model: "CG 160", type: "MOTORCYCLE", fuelType: "FLEX" },
    { brand: "Honda", model: "Bros 160", type: "MOTORCYCLE", fuelType: "FLEX" },
    { brand: "Toyota", model: "Hilux", type: "TRUCK", fuelType: "DIESEL" },
    { brand: "Renault", model: "Master", type: "VAN", fuelType: "DIESEL" },
    { brand: "Mercedes-Benz", model: "Accelo", type: "TRUCK", fuelType: "DIESEL" },
    { brand: "Ford", model: "Transit", type: "VAN", fuelType: "DIESEL" },
  ];

  const colors = ["Branco", "Prata", "Preto", "Cinza", "Vermelho", "Azul"];
  const statuses = ["AVAILABLE", "IN_USE", "MAINTENANCE"];

  function generateRandomPlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let plate = '';
    for (let i = 0; i < 3; i++) plate += letters.charAt(Math.floor(Math.random() * letters.length));
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    plate += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++) plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return plate;
  }

  for (const company of companies) {
    console.log(`Seeding 10 vehicles for company ${company.id}...`);
    for (let i = 0; i < 10; i++) {
        const template = vehiclesData[Math.floor(Math.random() * vehiclesData.length)];
        const plate = generateRandomPlate();
        const year = 2018 + Math.floor(Math.random() * 7); // 2018-2024
        
        await prisma.vehicle.create({
            data: {
                companyId: company.id,
                plate: plate,
                brand: template.brand,
                model: template.model,
                type: template.type,
                fuelType: template.fuelType,
                yearManufacture: year,
                yearModel: year + (Math.random() > 0.7 ? 1 : 0),
                color: colors[Math.floor(Math.random() * colors.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                currentMileage: Math.floor(Math.random() * 150000),
                renavam: Math.floor(Math.random() * 10000000000).toString(),
                chassis: "9BW" + Math.random().toString(36).substring(2, 15).toUpperCase(),
                fleetNumber: "F-" + (i + 1).toString().padStart(3, '0')
            }
        });
    }
  }

  console.log("Vehicle seeding finished successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
