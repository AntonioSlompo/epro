"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";
import { TransactionDirection, InventoryTransactionType } from "@prisma/client";

export async function getInventoryBalances({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", balances: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = {
            companyId: tenantId,
        };

        if (search) {
            where.OR = [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { storageLocation: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [balances, total] = await Promise.all([
            prisma.inventoryBalance.findMany({
                where,
                include: {
                    product: true,
                    storageLocation: true
                },
                orderBy: {
                    quantity: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.inventoryBalance.count({ where })
        ]);

        return { 
            success: true, 
            balances: serializePrisma(balances), 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching inventory balances:", error);
        return { success: false, error: "Failed to fetch inventory balances.", balances: [], totalPages: 0 };
    }
}

export async function getInventoryTransactions({ 
    page = 1, 
    limit = 10,
    search = ""
}: { 
    page?: number, 
    limit?: number,
    search?: string
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", transactions: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = { companyId: tenantId };

        if (search) {
            where.OR = [
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { notes: { contains: search, mode: 'insensitive' } },
                { sourceLocation: { name: { contains: search, mode: 'insensitive' } } },
                { destinationLocation: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [transactions, total] = await Promise.all([
            prisma.inventoryTransaction.findMany({
                where,
                include: {
                    product: true,
                    sourceLocation: true,
                    destinationLocation: true,
                    user: { select: { name: true } }
                },
                orderBy: {
                    date: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.inventoryTransaction.count({ where })
        ]);

        return { 
            success: true, 
            transactions: serializePrisma(transactions), 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching inventory transactions:", error);
        return { success: false, error: "Failed to fetch inventory transactions.", transactions: [], totalPages: 0 };
    }
}

export async function createInventoryMove(data: {
    productId: string;
    type: InventoryTransactionType;
    direction: TransactionDirection;
    quantity: number;
    sourceLocationId?: string;
    destinationLocationId?: string;
    unitCost?: number;
    document?: string;
    notes?: string;
    date?: Date;
}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the transaction record
            const totalCost = data.unitCost ? data.unitCost * data.quantity : null;
            
            const transaction = await tx.inventoryTransaction.create({
                data: {
                    companyId: tenantId,
                    productId: data.productId,
                    type: data.type,
                    direction: data.direction,
                    quantity: data.quantity,
                    sourceLocationId: data.sourceLocationId,
                    destinationLocationId: data.destinationLocationId,
                    unitCost: data.unitCost,
                    totalCost,
                    document: data.document,
                    notes: data.notes,
                    date: data.date || new Date(),
                }
            });

            // 2. Adjust balances based on direction and type
            // Helper to update balance
            const updateBalance = async (locId: string, qtyChange: number) => {
                const existing = await tx.inventoryBalance.findUnique({
                    where: {
                        companyId_productId_storageLocationId: {
                            companyId: tenantId,
                            productId: data.productId,
                            storageLocationId: locId
                        }
                    }
                });

                if (existing) {
                    return tx.inventoryBalance.update({
                        where: { id: existing.id },
                        data: { quantity: { increment: qtyChange } }
                    });
                } else {
                    return tx.inventoryBalance.create({
                        data: {
                            companyId: tenantId,
                            productId: data.productId,
                            storageLocationId: locId,
                            quantity: qtyChange
                        }
                    });
                }
            };

            if (data.type === 'TRANSFER' && data.sourceLocationId && data.destinationLocationId) {
                // Deduct from source
                await updateBalance(data.sourceLocationId, -data.quantity);
                // Add to destination
                await updateBalance(data.destinationLocationId, data.quantity);
            } else if (data.direction === 'IN' && data.destinationLocationId) {
                await updateBalance(data.destinationLocationId, data.quantity);
            } else if (data.direction === 'OUT' && data.sourceLocationId) {
                await updateBalance(data.sourceLocationId, -data.quantity);
            }

            return transaction;
        });

        revalidatePath('/[locale]/(main)/inventory');
        return { success: true, transaction: result };
    } catch (error: any) {
        console.error("Error creating inventory move:", error);
        return { success: false, error: error.message || "Failed to create inventory move." };
    }
}
