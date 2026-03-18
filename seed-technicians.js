const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTechnicians() {
    console.log('--- Iniciando Geração de Técnicos ---');
    
    // Buscar todas as empresas
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
        console.log('Nenhuma empresa encontrada para gerar técnicos.');
        return;
    }

    const firstNames = ['André', 'Bruno', 'Carlos', 'Daniel', 'Eduardo', 'Felipe', 'Gabriel', 'Henrique', 'Igor', 'João', 'Lucas', 'Mateus', 'Natan', 'Otávio', 'Paulo', 'Ricardo', 'Samuel', 'Tiago', 'Victor', 'Yuri'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'];
    const departments = ['Monitoramento', 'Manutenção', 'Instalação', 'Infraestrutura', 'Redes', 'Configuração'];
    const specialties = ['Alarmes', 'Cerca Elétrica', 'Câmeras IP', 'Câmeras Analógicas', 'Controle de Acesso', 'Redes', 'Cabeamento Estruturado', 'Som Ambiente'];

    console.log(`Encontradas ${companies.length} empresas. Gerando 100 técnicos para cada...`);

    for (const company of companies) {
        console.log(`Processando empresa: ${company.name} (${company.id})`);
        
        const techniciansData = [];
        
        for (let i = 1; i <= 100; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName} ${i}`; // i para unicidade se precisar
            const dept = departments[Math.floor(Math.random() * departments.length)];
            
            // Especialidades aleatórias (1 a 3)
            const numSpecialties = Math.floor(Math.random() * 3) + 1;
            const techSpecs = [];
            for(let j=0; j<numSpecialties; j++) {
                const spec = specialties[Math.floor(Math.random() * specialties.length)];
                if(!techSpecs.includes(spec)) techSpecs.push(spec);
            }

            techniciansData.push({
                companyId: company.id,
                name: fullName,
                department: dept,
                specialties: techSpecs.join(', '),
                active: true,
                email: `tech${i}@${company.slug || 'epro'}.com.br`,
                phone: '(11) 98888-0000',
                mobile: '(11) 99999-0000',
                document: '000.000.000-00',
                notes: 'Técnico gerado automaticamente para testes.'
            });
        }

        const result = await prisma.technician.createMany({
            data: techniciansData,
        });

        console.log(`  > Criados ${result.count} técnicos para ${company.name}`);
    }

    console.log('--- Geração Finalizada ---');
}

seedTechnicians()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
