"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";
import { ContractStatus } from "@prisma/client";

export async function getContracts({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", contracts: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = {
            companyId: tenantId,
        };

        if (search) {
            where.OR = [
                { contractNumber: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { tradeName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [contracts, total] = await Promise.all([
            prisma.contract.findMany({
                where,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            tradeName: true,
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.contract.count({ where })
        ]);

        return { 
            success: true, 
            contracts: serializePrisma(contracts), 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching contracts:", error);
        return { success: false, error: "Failed to fetch contracts.", contracts: [], totalPages: 0 };
    }
}

export async function getContract(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", contract: null };

    try {
        const contract = await prisma.contract.findFirst({
            where: {
                id,
                companyId: tenantId,
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        return { success: true, contract: serializePrisma(contract) };
    } catch (error) {
        console.error("Error fetching contract:", error);
        return { success: false, error: "Failed to fetch contract." };
    }
}

export async function createContract(data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const { items, ...contractData } = data;

        // Simple duplicate number handling
        const existing = await prisma.contract.findFirst({
            where: {
                companyId: tenantId,
                contractNumber: contractData.contractNumber
            }
        });
        
        if (existing) {
            return { success: false, error: "Número de contrato já existe nesta empresa." };
        }

        const newContract = await prisma.contract.create({
            data: {
                ...contractData,
                companyId: tenantId,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        discount: item.discount || 0,
                        total: item.total,
                        description: item.description,
                    }))
                }
            }
        });

        revalidatePath('/[locale]/(main)/contracts');
        return { success: true, contract: serializePrisma(newContract) };
    } catch (error) {
        console.error("Error creating contract:", error);
        return { success: false, error: "Failed to create contract." };
    }
}

export async function updateContract(id: string, data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const { items, ...contractData } = data;

        const existing = await prisma.contract.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Contract not found." };
        }
        
        // Update contract and its items
        // Strategy: delete existing items and recreate them or update individually?
        // Recreating is simpler for this structure.
        const updatedContract = await prisma.$transaction(async (tx) => {
            // Delete old items
            await tx.contractItem.deleteMany({
                where: { contractId: id }
            });

            // Update contract and create new items
            return await tx.contract.update({
                where: { id },
                data: {
                    ...contractData,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount || 0,
                            total: item.total,
                            description: item.description,
                        }))
                    }
                }
            });
        });

        revalidatePath('/[locale]/(main)/contracts');
        revalidatePath(`/[locale]/(main)/contracts/${id}/edit`);
        return { success: true, contract: serializePrisma(updatedContract) };
    } catch (error) {
        console.error("Error updating contract:", error);
        return { success: false, error: "Failed to update contract." };
    }
}

export async function deleteContract(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await prisma.contract.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Contract not found." };
        }
        
        await prisma.contract.delete({
            where: { id }
        });

        revalidatePath('/[locale]/(main)/contracts');
        return { success: true };
    } catch (error) {
        console.error("Error deleting contract:", error);
        return { success: false, error: "Failed to delete contract." };
    }
}
