"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";
import { type BankAccountFormValues, bankAccountSchema } from "@/schemas/bank-account-schema";

export async function getBankAccounts({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", bankAccounts: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = {
            companyId: tenantId,
        };

        if (search) {
            where.OR = [
                { agency: { contains: search, mode: 'insensitive' } },
                { number: { contains: search, mode: 'insensitive' } },
                { bank: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [bankAccounts, total, balances] = await Promise.all([
            (prisma as any).bankAccount.findMany({
                where,
                include: {
                    bank: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            (prisma as any).bankAccount.count({ where }),
            (prisma as any).bankAccountTransaction.groupBy({
                by: ['bankAccountId'],
                where: {
                    companyId: tenantId
                },
                _sum: {
                    amount: true
                }
            })
        ]);

        // Note: groupBy with Sum alone doesn't handle Credit/Debit easily without separate sums.
        // Let's use a more precise mapping or just separate credit/debit sums.
        
        const detailedBalances = await (prisma as any).bankAccountTransaction.groupBy({
            by: ['bankAccountId', 'type'],
            where: {
                companyId: tenantId
            },
            _sum: {
                amount: true
            }
        });

        const balancesMap: Record<string, number> = {};
        detailedBalances.forEach((item: any) => {
            const amount = Number(item._sum.amount || 0);
            if (!balancesMap[item.bankAccountId]) balancesMap[item.bankAccountId] = 0;
            if (item.type === 'CREDIT') {
                balancesMap[item.bankAccountId] += amount;
            } else {
                balancesMap[item.bankAccountId] -= amount;
            }
        });

        const bankAccountsWithBalance = bankAccounts.map((account: any) => ({
            ...account,
            balance: balancesMap[account.id] || 0,
            totalAvailable: (balancesMap[account.id] || 0) + Number(account.limit || 0)
        }));

        return { 
            success: true, 
            bankAccounts: serializePrisma(bankAccountsWithBalance), 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching bank accounts:", error);
        return { success: false, error: "Failed to fetch bank accounts.", bankAccounts: [], totalPages: 0 };
    }
}

export async function getBankAccount(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", bankAccount: null };

    try {
        const bankAccount = await (prisma as any).bankAccount.findFirst({
            where: {
                id,
                companyId: tenantId,
            },
            include: {
                bank: true
            }
        });
        return { success: true, bankAccount: serializePrisma(bankAccount) };
    } catch (error) {
        console.error("Error fetching bank account:", error);
        return { success: false, error: "Failed to fetch bank account." };
    }
}

export async function createBankAccount(data: BankAccountFormValues) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const result = bankAccountSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const { id, ...cleanData } = result.data;
        
        // Robust parsing for limit
        const limitStr = String(cleanData.limit || "0");
        const parsedLimit = parseFloat(limitStr.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
        
        const newBankAccount = await (prisma as any).bankAccount.create({
            data: {
                ...cleanData,
                limit: isNaN(parsedLimit) ? 0 : parsedLimit,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/bank-accounts');
        return { success: true, bankAccount: serializePrisma(newBankAccount) };
    } catch (error) {
        console.error("Error creating bank account:", error);
        return { success: false, error: "Failed to create bank account." };
    }
}

export async function updateBankAccount(id: string, data: Partial<BankAccountFormValues>) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const result = bankAccountSchema.partial().safeParse(data);
    if (!result.success) {
        return { success: false, error: "Invalid data" };
    }

    try {
        const updateData: any = { ...result.data };
        
        if (updateData.limit !== undefined) {
            const limitStr = String(updateData.limit || "0");
            const parsedLimit = parseFloat(limitStr.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
            updateData.limit = isNaN(parsedLimit) ? 0 : parsedLimit;
        }

        const updatedBankAccount = await (prisma as any).bankAccount.update({
            where: { 
                id,
                companyId: tenantId 
            },
            data: updateData
        });

        revalidatePath('/[locale]/(main)/bank-accounts');
        revalidatePath(`/[locale]/(main)/bank-accounts/${id}/edit`);
        return { success: true, bankAccount: serializePrisma(updatedBankAccount) };
    } catch (error) {
        console.error("Error updating bank account:", error);
        return { success: false, error: "Failed to update bank account." };
    }
}

export async function deleteBankAccount(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        await (prisma as any).bankAccount.delete({
            where: { 
                id,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/bank-accounts');
        return { success: true };
    } catch (error) {
        console.error("Error deleting bank account:", error);
        return { success: false, error: "Failed to delete bank account." };
    }
}
