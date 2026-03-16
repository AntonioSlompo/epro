const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restore() {
    console.log('Restoring database accounts...');
    
    // Create Default Company
    let company = await prisma.company.findFirst({ where: { name: 'E-PRO Sistemas' } });
    if (!company) {
        // Find existing company to avoid creating duplicates if one already exists
        const anyComp = await prisma.company.findFirst();
        if (anyComp) {
            company = anyComp;
        } else {
            company = await prisma.company.create({
                data: {
                    name: 'E-PRO Sistemas',
                    tradeName: 'E-PRO',
                    cnpj: '00000000000000',
                    active: true,
                    slug: 'epro-sistemas'
                }
            });
            console.log('Created Company:', company.name);
        }
    }
    
    // Restore Admin
    const adminEmail = 'admin@epro.com';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Administrador',
                password: '123456',
                active: true,
                role: 'SUPER_ADMIN',
                companies: {
                    connect: { id: company.id }
                }
            }
        });
        console.log(`Created user: ${adminEmail}`);
    } else {
        await prisma.user.update({
            where: { email: adminEmail },
            data: { password: '123456', active: true }
        });
        console.log(`Updated user: ${adminEmail}`);
    }

    // Restore Antonio
    const antonioEmail = 'antonio.slompo@gmail.com';
    let antonio = await prisma.user.findUnique({ where: { email: antonioEmail } });
    if (!antonio) {
        antonio = await prisma.user.create({
            data: {
                email: antonioEmail,
                name: 'Antonio Slompo',
                password: '123456',
                active: true,
                role: 'SUPER_ADMIN',
                companies: {
                    connect: { id: company.id }
                }
            }
        });
        console.log(`Created user: ${antonioEmail}`);
    } else {
        await prisma.user.update({
            where: { email: antonioEmail },
            data: { password: '123456', active: true }
        });
        console.log(`Updated user: ${antonioEmail}`);
    }
}

restore()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
