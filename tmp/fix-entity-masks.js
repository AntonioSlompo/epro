const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function formatCPF(value) {
    if (!value) return value;
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 11) return value;
    return clean
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

function formatCNPJ(value) {
    if (!value) return value;
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 14) return value;
    return clean
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatCEP(value) {
    if (!value) return value;
    const clean = value.replace(/\D/g, '');
    if (clean.length !== 8) return value;
    return clean.replace(/^(\d{5})(\d)/, '$1-$2');
}

function formatPhone(value) {
    if (!value) return value;
    const clean = value.replace(/\D/g, '');
    if (clean.length === 10) {
        return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 11) {
        return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
}

async function main() {
    console.log('--- Iniciando correção de máscaras nas Entidades ---');
    
    const entities = await prisma.entity.findMany();
    console.log(`Total de registros para analisar: ${entities.length}`);

    let updatedCount = 0;

    for (const entity of entities) {
        const updates = {};

        // 1. Documento (CPF/CNPJ)
        const cleanDoc = entity.document ? entity.document.replace(/\D/g, '') : '';
        if (cleanDoc.length === 11) {
            const formatted = formatCPF(cleanDoc);
            if (formatted !== entity.document) updates.document = formatted;
        } else if (cleanDoc.length === 14) {
            const formatted = formatCNPJ(cleanDoc);
            if (formatted !== entity.document) updates.document = formatted;
        }

        // 2. CEP
        if (entity.zip) {
            const cleanZip = entity.zip.replace(/\D/g, '');
            if (cleanZip.length === 8) {
                const formatted = formatCEP(cleanZip);
                if (formatted !== entity.zip) updates.zip = formatted;
            }
        }

        // 3. Telefone
        if (entity.phone) {
            const formatted = formatPhone(entity.phone);
            if (formatted !== entity.phone) updates.phone = formatted;
        }

        // 4. Celular
        if (entity.mobile) {
            const formatted = formatPhone(entity.mobile);
            if (formatted !== entity.mobile) updates.mobile = formatted;
        }

        if (Object.keys(updates).length > 0) {
            await prisma.entity.update({
                where: { id: entity.id },
                data: updates
            });
            updatedCount++;
            if (updatedCount % 50 === 0) console.log(`${updatedCount} registros atualizados...`);
        }
    }

    console.log(`--- Correção finalizada! ---`);
    console.log(`Total de registros atualizados: ${updatedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
