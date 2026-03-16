const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database.`);
    if (users.length > 0) {
        console.log('First user:', users[0].email);
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
