const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const companies_ids = [];

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true } });
  if (companies.length === 0) {
    console.log("No companies found.");
    return;
  }

  const productsData = [
    { name: "Câmera IP Bullet 2MP", sku_prefix: "CAM-B-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8525.80.19", brand: "Intelbras", price: 250.00 },
    { name: "Câmera IP Dome 2MP", sku_prefix: "CAM-D-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8525.80.19", brand: "Hikvision", price: 230.00 },
    { name: "Sensor de Movimento Infravermelho", sku_prefix: "SEN-IV-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8531.10.90", brand: "JFL", price: 85.00 },
    { name: "Cabo Coaxial HD 100m", sku_prefix: "CAB-HD-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8544.49.00", brand: "Condutti", price: 120.00 },
    { name: "Bateria Selada 12V 7Ah", sku_prefix: "BAT-7A-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8507.20.10", brand: "Moura", price: 110.00 },
    { name: "Gravador Digital NVR 8 Canais", sku_prefix: "NVR-08-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8521.90.00", brand: "Intelbras", price: 850.00 },
    { name: "Sirene de Alta Potência 120dB", sku_prefix: "SIR-HP-", type: "PHYSICAL", category: "EQUIPMENT", ncm: "8531.10.90", brand: "Ipec", price: 45.00 },
    { name: "Monitoramento 24h Residencial", sku_prefix: "SRV-MON-", type: "SERVICE_RECURRING", category: "MONITORING", ncm: null, price: 150.00, isRecurring: true },
    { name: "Manutenção Mensal Corretiva", sku_prefix: "SRV-MAN-", type: "SERVICE_RECURRING", category: "MAINTENANCE", ncm: null, price: 50.00, isRecurring: true },
    { name: "Licença Software Cloud Storage", sku_prefix: "LIC-CLD-", type: "SERVICE_RECURRING", category: "SOFTWARE_LICENSE", ncm: null, price: 29.90, isRecurring: true },
    { name: "Vistoria Técnica Padrão", sku_prefix: "SRV-VIS-", type: "SERVICE_ONETIME", category: "MAINTENANCE", ncm: null, price: 80.00 },
    { name: "Instalação Ponto de Câmera", sku_prefix: "SRV-INS-", type: "SERVICE_ONETIME", category: "INSTALLATION", ncm: null, price: 120.00 },
  ];

  for (const company of companies) {
    console.log(`Seeding 100 products for company ${company.id}...`);
    for (let i = 1; i <= 100; i++) {
      const template = productsData[Math.floor(Math.random() * productsData.length)];
      const sku = `${template.sku_prefix}${String(i).padStart(3, '0')}`;
      
      const isRecurring = template.isRecurring || false;
      const suggestedSellingPrice = template.price + (Math.random() * 20); // Add a bit of variation
      
      await prisma.product.upsert({
        where: {
          companyId_sku: {
            companyId: company.id,
            sku: sku
          }
        },
        update: {},
        create: {
          companyId: company.id,
          name: `${template.name} - Var ${i}`,
          sku: sku,
          type: template.type,
          category: template.category,
          status: "ACTIVE",
          description: `Produto/Serviço gerado automaticamente para testes. Referência ${i}.`,
          ncm: template.ncm,
          brand: template.brand || null,
          suggestedSellingPrice: suggestedSellingPrice,
          averageCost: suggestedSellingPrice * 0.6,
          isRecurring: isRecurring,
          periodicity: isRecurring ? "MONTHLY" : null,
          billingType: isRecurring ? "POSTPAID" : null,
          subscriptionPrice: isRecurring ? suggestedSellingPrice : null,
          requiresTechnicalInspection: template.category === "INSTALLATION" || template.category === "MAINTENANCE",
        }
      });
    }
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
