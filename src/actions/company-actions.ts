'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { companySchema, CompanyFormValues } from "@/schemas/company-schema"
import { Prisma } from "@prisma/client"

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

        return { data, totalPages, currentPage: page, total };
    } catch (error) {
        console.error("Error fetching companies:", error);
        throw new Error("Failed to fetch companies");
    }
}

export async function getCompany(id: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { id },
        });
        return company;
    } catch (error) {
        console.error("Error fetching company:", error);
        return null; // Return null instead of throwing for better handling in UI
    }
}

export async function createCompany(data: CompanyFormValues) {
    const validation = companySchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten() };
    }

    try {
        const company = await prisma.company.create({
            data: {
                ...validation.data,
                // Ensure unique constraints errors are caught
            },
        });
        revalidatePath('/companies');
        return { success: true, data: company };
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
    const validation = companySchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten() };
    }

    try {
        const { id: _, ...updateData } = validation.data; // Exclude ID from update

        const company = await prisma.company.update({
            where: { id },
            data: updateData,
        });
        revalidatePath('/companies');
        return { success: true, data: company };
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

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);

        if (!response.ok) {
            if (response.status === 404) return { success: false, error: "CNPJ não encontrado" };
            return { success: false, error: "Erro ao consultar CNPJ" };
        }

        const data = await response.json();

        return {
            success: true,
            data: {
                name: data.razao_social,
                tradeName: data.nome_fantasia,
                document: cleanCnpj,
                documentType: "CNPJ",
                email: data.email,
                phone: data.ddd_telefone_1,

                // Address (mapping BrasilAPI to our schema)
                zip: data.cep,
                street: data.logradouro,
                number: data.numero,
                complement: data.complemento,
                neighborhood: data.bairro,
                city: data.municipio,
                state: data.uf,
            }
        };
    } catch (error) {
        console.error("BrasilAPI error:", error);
        return { success: false, error: "Erro ao conectar com API externa" };
    }
}
