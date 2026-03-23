"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { type BankFormValues, bankSchema } from "@/schemas/bank-schema";

export async function getBanks({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", banks: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where = {
            companyId: tenantId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { code: { contains: search, mode: 'insensitive' as const } },
                    { nickname: { contains: search, mode: 'insensitive' as const } },
                ]
            } : {})
        };

        const [banks, total] = await Promise.all([
            (prisma as any).bank.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: limit
            }),
            (prisma as any).bank.count({ where })
        ]);

        return { 
            success: true, 
            banks, 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching banks:", error);
        return { success: false, error: "Failed to fetch banks.", banks: [], totalPages: 0 };
    }
}

export async function getBank(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", bank: null };

    try {
        const bank = await (prisma as any).bank.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });
        return { success: true, bank };
    } catch (error) {
        console.error("Error fetching bank:", error);
        return { success: false, error: "Failed to fetch bank." };
    }
}

export async function createBank(data: BankFormValues) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const result = bankSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const newBank = await (prisma as any).bank.create({
            data: {
                ...result.data,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/banks');
        return { success: true, bank: newBank };
    } catch (error) {
        console.error("Error creating bank:", error);
        return { success: false, error: "Failed to create bank." };
    }
}

export async function updateBank(id: string, data: Partial<BankFormValues>) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const updatedBank = await (prisma as any).bank.update({
            where: { 
                id,
                companyId: tenantId 
            },
            data
        });

        revalidatePath('/[locale]/(main)/banks');
        revalidatePath(`/[locale]/(main)/banks/${id}/edit`);
        return { success: true, bank: updatedBank };
    } catch (error) {
        console.error("Error updating bank:", error);
        return { success: false, error: "Failed to update bank." };
    }
}

export async function deleteBank(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        await (prisma as any).bank.delete({
            where: { 
                id,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/banks');
        return { success: true };
    } catch (error) {
        console.error("Error deleting bank:", error);
        return { success: false, error: "Failed to delete bank." };
    }
}
