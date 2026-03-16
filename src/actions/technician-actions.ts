"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { type TechnicianFormValues } from "@/schemas/technician-schema";
import { Prisma } from "@prisma/client";

export async function getTechnicians({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", technicians: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where = {
            companyId: tenantId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { document: { contains: search } },
                    { department: { contains: search, mode: 'insensitive' as const } },
                ]
            } : {})
        };

        const [technicians, total] = await Promise.all([
            (prisma as any).technician.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: limit
            }),
            (prisma as any).technician.count({ where })
        ]);

        return { 
            success: true, 
            technicians, 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching technicians:", error);
        return { success: false, error: "Failed to fetch technicians.", technicians: [], totalPages: 0 };
    }
}

export async function getTechnician(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", technician: null };

    try {
        const technician = await (prisma as any).technician.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });
        return { success: true, technician };
    } catch (error) {
        console.error("Error fetching technician:", error);
        return { success: false, error: "Failed to fetch technician." };
    }
}

export async function createTechnician(data: TechnicianFormValues) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        if (data.userId) {
            const existingUserLink = await (prisma as any).technician.findFirst({
                where: {
                    companyId: tenantId,
                    userId: data.userId
                }
            });
            if (existingUserLink) {
                return { success: false, error: "Este usuário já está vinculado a outro técnico." };
            }
        }

        const newTechnician = await (prisma as any).technician.create({
            data: {
                ...data,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/technicians');
        return { success: true, technician: newTechnician };
    } catch (error) {
        console.error("Error creating technician:", error);
        return { success: false, error: "Failed to create technician." };
    }
}

export async function updateTechnician(id: string, data: Partial<TechnicianFormValues>) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await (prisma as any).technician.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Technician not found." };
        }
        
        if (data.userId && data.userId !== (existing as any).userId) {
            const existingUserLink = await (prisma as any).technician.findFirst({
                where: {
                    companyId: tenantId,
                    userId: data.userId,
                    id: { not: id }
                }
            });
            if (existingUserLink) {
                return { success: false, error: "Este usuário já está vinculado a outro técnico." };
            }
        }

        const updatedTechnician = await (prisma as any).technician.update({
            where: { id },
            data
        });

        revalidatePath('/[locale]/(main)/technicians');
        revalidatePath(`/[locale]/(main)/technicians/${id}/edit`);
        return { success: true, technician: updatedTechnician };
    } catch (error) {
        console.error("Error updating technician:", error);
        return { success: false, error: "Failed to update technician." };
    }
}

export async function deleteTechnician(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await (prisma as any).technician.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Technician not found." };
        }
        
        await (prisma as any).technician.delete({
            where: { id }
        });

        revalidatePath('/[locale]/(main)/technicians');
        return { success: true };
    } catch (error) {
        console.error("Error deleting technician:", error);
        return { success: false, error: "Failed to delete technician." };
    }
}

export async function getAvailableUsersForTechnician() {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, users: [] };

    try {
        // Find users linked to this company
        const company = await prisma.company.findUnique({
            where: { id: tenantId },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!company) {
            return { success: false, users: [] };
        }

        // Return all company users so we can link them
        return { 
            success: true, 
            users: company.users
        };

    } catch (error) {
        console.error("Error fetching available users:", error);
        return { success: false, users: [] };
    }
}
