"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";

export async function getEntities({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", entities: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = {
            companyId: tenantId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tradeName: { contains: search, mode: 'insensitive' } },
                { document: { contains: search } },
            ];
        }

        const [entities, total] = await Promise.all([
            prisma.entity.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.entity.count({ where })
        ]);

        return { 
            success: true, 
            entities, 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching entities:", error);
        return { success: false, error: "Failed to fetch entities.", entities: [], totalPages: 0 };
    }
}

export async function getEntity(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", entity: null };

    try {
        const entity = await prisma.entity.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });
        return { success: true, entity };
    } catch (error) {
        console.error("Error fetching entity:", error);
        return { success: false, error: "Failed to fetch entity." };
    }
}

export async function createEntity(data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        // Simple duplicate document handling on same tenant
        const existing = await prisma.entity.findFirst({
            where: {
                companyId: tenantId,
                document: data.document
            }
        });
        
        if (existing) {
            return { success: false, error: "Documento já cadastrado nesta empresa." };
        }

        const newEntity = await prisma.entity.create({
            data: {
                ...data,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/entities');
        return { success: true, entity: newEntity };
    } catch (error) {
        console.error("Error creating entity:", error);
        return { success: false, error: "Failed to create entity." };
    }
}

export async function updateEntity(id: string, data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        // Enforce tenant isolation visually check if user owns item
        const existing = await prisma.entity.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Entity not found." };
        }
        
        const updatedEntity = await prisma.entity.update({
            where: { id },
            data
        });

        revalidatePath('/[locale]/(main)/entities');
        revalidatePath(`/[locale]/(main)/entities/${id}/edit`);
        return { success: true, entity: updatedEntity };
    } catch (error) {
        console.error("Error updating entity:", error);
        return { success: false, error: "Failed to update entity." };
    }
}

export async function deleteEntity(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await prisma.entity.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Entity not found." };
        }
        
        await prisma.entity.delete({
            where: { id }
        });

        revalidatePath('/[locale]/(main)/entities');
        return { success: true };
    } catch (error) {
        console.error("Error deleting entity:", error);
        return { success: false, error: "Failed to delete entity." };
    }
}
