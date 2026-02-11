import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding companies...')

    const companies = [
        {
            name: 'TechSolutions Ltda',
            tradeName: 'TechSol',
            slug: 'tech-solutions',
            cnpj: '12.345.678/0001-90',
            email: 'contact@techsol.com',
            phone: '(11) 3333-4444',
            website: 'https://techsol.com',
            address: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            cep: '01310-100',
            active: true,
            subscriptionStatus: 'ACTIVE',
            distributionModel: 'LIVRE',
            portalMode: 'LISTING'
        },
        {
            name: 'Indústrias Metalúrgicas do Sul S.A.',
            tradeName: 'MetalSul',
            slug: 'metalsul',
            cnpj: '98.765.432/0001-10',
            email: 'vendas@metalsul.com.br',
            phone: '(51) 3222-1111',
            address: 'Rua das Indústrias',
            number: '500',
            neighborhood: 'Distrito Industrial',
            city: 'Porto Alegre',
            state: 'RS',
            cep: '90000-000',
            active: true,
            subscriptionStatus: 'ACTIVE',
            distributionModel: 'RESTRITO',
            portalMode: 'CATALOG'
        },
        {
            name: 'Comércio e Importação Silva & Silva',
            tradeName: 'Silva Imports',
            slug: 'silva-imports',
            cnpj: '55.444.333/0001-22',
            email: 'contato@silvaimports.com',
            whatsapp: '(21) 99999-8888',
            address: 'Rua do Porto',
            number: '25',
            neighborhood: 'Centro',
            city: 'Rio de Janeiro',
            state: 'RJ',
            cep: '20000-000',
            active: true,
            subscriptionStatus: 'INACTIVE', // Example of inactive subscription
            distributionModel: 'LIVRE',
            portalMode: 'LISTING'
        }
    ]

    for (const company of companies) {
        // Check if exists to avoid unique constraint errors if re-run
        const existing = await prisma.company.findUnique({
            where: { slug: company.slug }
        })

        if (!existing) {
            await prisma.company.create({
                data: company
            })
            console.log(`Created company: ${company.name}`)
        } else {
            console.log(`Company already exists: ${company.name}`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
