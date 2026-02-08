import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@epro.com'
    const password = 'admin' // Simple password for demo

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (!existingUser) {
        await prisma.user.create({
            data: {
                email,
                name: 'Admin User',
                password,
                active: true,
                image: '', // No image for now
            },
        })
        console.log(`Created user: ${email} with password: ${password}`)
    } else {
        // Update password just in case
        await prisma.user.update({
            where: { email },
            data: { password, active: true }
        })
        console.log(`Updated user: ${email} with password: ${password}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
