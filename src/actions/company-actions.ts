'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { companySchema, CompanyFormValues } from "@/schemas/company-schema"
import { Prisma } from "@prisma/client"
import { getCurrentUser } from "@/actions/auth-actions"
import { mapCompanyToSafe, serializePrisma } from "@/lib/utils"

export async function getCompanies(page = 1, pageSize = 10, search = "") {
    const skip = (page - 1) * pageSize;

    const where: Prisma.CompanyWhereInput = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { tradeName: { contains: search, mode: 'insensitive' } },
                { cnpj: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    try {
        const [data, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { name: 'asc' },
                include: { plan: true }
            }),
            prisma.company.count({ where }),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        // Omit Uint8Array logoData for Client Components serialization and add base64
        const safeData = serializePrisma(data.map(mapCompanyToSafe));

        return { data: safeData as any, totalPages, currentPage: page, total };
    } catch (error) {
        console.error("Error fetching companies:", error);
        throw new Error("Failed to fetch companies");
    }
}

export async function getCompaniesList() {
    try {
        const companies = await prisma.company.findMany({
            where: { active: true },
            select: { id: true, name: true, tradeName: true },
            orderBy: { name: 'asc' }
        });
        return companies;
    } catch (error) {
        console.error("Error fetching companies list:", error);
        return [];
    }
}

export async function searchCompaniesByNameOrCnpj(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const companies = await prisma.company.findMany({
            where: {
                active: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { tradeName: { contains: query, mode: 'insensitive' } },
                    { cnpj: { contains: query } }
                ]
            },
            take: 20, // Limit to 20 for autocomplete
            select: { id: true, name: true, cnpj: true, tradeName: true }
        });
        return companies;
    } catch (error) {
        console.error("Error searching companies:", error);
        return [];
    }
}

export async function getCompany(id: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { id },
        });

        if (!company) return null;

        return serializePrisma(mapCompanyToSafe(company));
    } catch (error) {
        console.error("Error fetching company:", error);
        return null; // Return null instead of throwing for better handling in UI
    }
}

export async function createCompany(data: CompanyFormValues) {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
        return { success: false, error: "Acesso não autorizado." };
    }

    const validation = companySchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten() };
    }

    try {
        const { document, street, zip, stateRegistration, documentType, latitude, longitude, planId, logoBase64, ...rest } = validation.data;

        let createData: any = {
            ...rest,
            cnpj: document,
            address: street,
            cep: zip,
            planId: planId === "" ? null : planId,
        };

        if (logoBase64 && logoBase64.startsWith('data:image/')) {
            const matches = logoBase64.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                createData.logoMimeType = matches[1];
                createData.logoData = Buffer.from(matches[2], 'base64');
            }
        }

        const company = await prisma.company.create({
            data: createData,
        });
        const { logoData: _logoData, ...safeCompany } = company;
        revalidatePath('/companies');
        return { success: true, data: safeCompany };
    } catch (error: any) {
        console.error("Error creating company:", error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('slug')) return { success: false, error: 'Slug já existe.' };
            if (target?.includes('cnpj')) return { success: false, error: 'CNPJ já cadastrado.' };
        }
        return { success: false, error: 'Erro ao criar empresa.' };
    }
}

export async function updateCompany(id: string, data: CompanyFormValues) {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
        return { success: false, error: "Acesso não autorizado." };
    }

    const validation = companySchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten() };
    }

    try {
        const { id: _, document, street, zip, stateRegistration, documentType, latitude, longitude, planId, logoBase64, ...rest } = validation.data; // Exclude ID and fields not in Company model

        let updateData: any = {
            ...rest,
            cnpj: document,
            address: street,
            cep: zip,
            planId: planId === "" ? null : planId,
        };

        if (logoBase64 === "") {
            updateData.logoData = null;
            updateData.logoMimeType = null;
            updateData.logoUrl = null;
        } else if (logoBase64 && logoBase64.startsWith('data:image/')) {
            const matches = logoBase64.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                updateData.logoMimeType = matches[1];
                updateData.logoData = Buffer.from(matches[2], 'base64');
                updateData.logoUrl = null;
            }
        }

        const company = await prisma.company.update({
            where: { id },
            data: updateData,
        });
        const { logoData: _logoData, ...safeCompany } = company;
        revalidatePath('/companies');
        return { success: true, data: safeCompany };
    } catch (error: any) {
        console.error("Error updating company:", error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target?.includes('slug')) return { success: false, error: 'Slug já existe.' };
            if (target?.includes('cnpj')) return { success: false, error: 'CNPJ já cadastrado.' };
        }
        return { success: false, error: 'Erro ao atualizar empresa.' };
    }
}

export async function deleteCompany(id: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
        return { success: false, error: "Acesso não autorizado." };
    }

    try {
        await prisma.company.delete({
            where: { id },
        });
        revalidatePath('/companies');
        return { success: true };
    } catch (error) {
        console.error("Error deleting company:", error);
        return { success: false, error: 'Erro ao excluir empresa.' };
    }
}

export async function fetchCompanyByCnpj(cnpj: string) {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return { success: false, error: "CNPJ inválido" };

    // Strategy: Try providers in order
    // 1. BrasilAPI (Most reliable, best data)
    try {
        const data = await fetchBrasilApi(cleanCnpj);
        if (data) return { success: true, data };
    } catch (error) {
        console.warn(`BrasilAPI failed for ${cleanCnpj}`, error);
    }

    // 2. ReceitaWS (Good fallback, 3 req/min limit)
    try {
        const data = await fetchReceitaWs(cleanCnpj);
        if (data) return { success: true, data };
    } catch (error) {
        console.warn(`ReceitaWS failed for ${cleanCnpj}`, error);
    }

    // 3. CNPJ.ws (Another free option, 3 req/min limit)
    try {
        const data = await fetchCnpjWs(cleanCnpj);
        if (data) return { success: true, data };
    } catch (error) {
        console.warn(`CNPJ.ws failed for ${cleanCnpj}`, error);
    }

    return { success: false, error: "Erro ao consultar CNPJ em todos os provedores disponíveis." };
}

async function fetchBrasilApi(cleanCnpj: string) {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
        headers: {
            'User-Agent': 'E-Pro/1.0',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 404) return null; // Not found is not an error to throw
        throw new Error(`BrasilAPI Error: ${response.status}`);
    }

    const data = await response.json();

    return {
        name: data.razao_social,
        tradeName: data.nome_fantasia,
        document: cleanCnpj,
        documentType: "CNPJ",
        email: data.email,
        phone: data.ddd_telefone_1,

        // Address
        zip: data.cep,
        street: data.logradouro,
        number: data.numero,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.municipio,
        state: data.uf,
    };
}

async function fetchReceitaWs(cleanCnpj: string) {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`ReceitaWS Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'ERROR') return null; // ReceitaWS returns 200 even for errors sometimes

    return {
        name: data.nome,
        tradeName: data.fantasia,
        document: cleanCnpj,
        documentType: "CNPJ",
        email: data.email,
        phone: data.telefone,

        // Address
        zip: data.cep?.replace(/\D/g, ''),
        street: data.logradouro,
        number: data.numero,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.municipio,
        state: data.uf,
    };
}

async function fetchCnpjWs(cleanCnpj: string) {
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`, {
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`CNPJ.ws Error: ${response.status}`);
    }

    const data = await response.json();

    return {
        name: data.razao_social,
        tradeName: data.nome_fantasia,
        document: cleanCnpj,
        documentType: "CNPJ",
        email: data.estabelecimento?.email,
        phone: data.estabelecimento?.telefone1,

        // Address
        zip: data.estabelecimento?.cep,
        street: `${data.estabelecimento?.tipo_logradouro} ${data.estabelecimento?.logradouro}`,
        number: data.estabelecimento?.numero,
        complement: data.estabelecimento?.complemento,
        neighborhood: data.estabelecimento?.bairro,
        city: data.estabelecimento?.cidade?.nome,
        state: data.estabelecimento?.estado?.sigla,
    };
}
