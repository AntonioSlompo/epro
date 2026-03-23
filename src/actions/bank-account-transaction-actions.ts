"use server"

import { prisma } from "@/lib/prisma"
import { getTenant } from "./auth-actions"
import { revalidatePath } from "next/cache"
import { bankAccountTransactionSchema, TransactionType, TransactionStatus } from "@/schemas/bank-account-transaction-schema"
import { serializePrisma } from "@/lib/utils"

// Fallback to raw SQL if the model is missing from the client but exists in the DB
async function getRawTransactions(bankAccountId: string, companyId: string, limit: number, offset: number, search: string) {
    const searchCondition = search ? `AND ("description" ILIKE '%${search}%' OR "category" ILIKE '%${search}%' OR "reference" ILIKE '%${search}%')` : "";
    const query = `
        SELECT * FROM "BankAccountTransaction" 
        WHERE "bankAccountId" = '${bankAccountId}' AND "companyId" = '${companyId}'
        ${searchCondition}
        ORDER BY "date" DESC
        LIMIT ${limit} OFFSET ${offset}
    `;
    return await (prisma as any).$queryRawUnsafe(query);
}

export async function getTransactions({ 
    bankAccountId, 
    limit = 50, 
    offset = 0,
    search = "" 
}: { 
    bankAccountId: string, 
    limit?: number, 
    offset?: number,
    search?: string 
}) {
    const companyId = await getTenant()
    if (!companyId) return { success: false, error: "Unauthorized" }

    try {
        const model = (prisma as any).bankAccountTransaction
        const accountModel = (prisma as any).bankAccount
        
        let transactions;
        let totalBalanceBefore = 0;
        let accountLimit = 0;

        // 1. Get Account Limit
        if (accountModel) {
            const account = await accountModel.findUnique({
                where: { id: bankAccountId },
                select: { limit: true }
            });
            accountLimit = Number(account?.limit || 0);
        }

        // 2. Get All transactions for this account to calculate running balance
        if (model) {
            // Calculate Starting Balance (sum of ALL transactions before the current offset)
            const transactionsBefore = await model.findMany({
                where: { bankAccountId, companyId: companyId },
                orderBy: [
                    { date: 'asc' },
                    { createdAt: 'asc' }
                ],
                take: offset,
                select: { amount: true, type: true }
            });

            let currentRunningBalance = transactionsBefore.reduce((acc: number, t: any) => {
                const amt = Number(t.amount);
                return t.type === 'CREDIT' ? acc + amt : acc - amt;
            }, 0);

            // Get the specific page in ASC order
            transactions = await model.findMany({
                where: {
                    bankAccountId,
                    companyId: companyId,
                    OR: [
                        { description: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                        { reference: { contains: search, mode: 'insensitive' } },
                    ]
                },
                orderBy: [
                    { date: 'asc' },
                    { createdAt: 'asc' }
                ],
                take: limit,
                skip: offset,
            });

            const transactionsWithRunningBalance = transactions.map((t: any) => {
                const amt = Number(t.amount);
                if (t.type === 'CREDIT') currentRunningBalance += amt;
                else currentRunningBalance -= amt;
                
                return {
                    ...t,
                    runningBalance: currentRunningBalance,
                    runningAvailable: currentRunningBalance + accountLimit
                };
            });

            return { success: true, transactions: serializePrisma(transactionsWithRunningBalance) }
        } else {
            console.warn("Prisma model 'bankAccountTransaction' not found, using raw SQL fallback")
            transactions = await getRawTransactions(bankAccountId, companyId, limit, offset, search)
            return { success: true, transactions: serializePrisma(transactions) }
        }
    } catch (error: any) {
        console.error("Error fetching transactions:", error)
        return { success: false, error: error.message || "Failed to fetch transactions" }
    }
}

export async function createTransaction(data: any) {
    const companyId = await getTenant()
    if (!companyId) return { success: false, error: "Unauthorized" }

    const validatedFields = bankAccountTransactionSchema.safeParse(data)

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" }
    }

    const { amount, ...rest } = validatedFields.data
    const parsedAmount = typeof amount === 'string' 
        ? parseFloat(amount.replace("R$ ", "").replace(/\./g, "").replace(",", "."))
        : Number(amount)

    try {
        const model = (prisma as any).bankAccountTransaction
        let transaction;
        if (model) {
            transaction = await model.create({
                data: {
                    ...rest,
                    amount: parsedAmount,
                    companyId: companyId,
                    status: TransactionStatus.PENDING
                },
            })
        } else {
            // Raw SQL for creation is more complex due to IDs and relations, try to use model first
            // If model is missing, it's likely a serious environment issue
            throw new Error("Prisma model 'bankAccountTransaction' not found. Please restart the dev server.")
        }

        revalidatePath(`/bank-accounts/${rest.bankAccountId}`)
        return { success: true, transaction: serializePrisma(transaction) }
    } catch (error: any) {
        console.error("Error creating transaction:", error)
        return { success: false, error: error.message || "Failed to create transaction" }
    }
}

export async function updateTransaction(id: string, data: any) {
    const companyId = await getTenant()
    if (!companyId) return { success: false, error: "Unauthorized" }

    const validatedFields = bankAccountTransactionSchema.safeParse(data)

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields" }
    }

    const { amount, ...rest } = validatedFields.data
    const parsedAmount = typeof amount === 'string' 
        ? parseFloat(amount.replace("R$ ", "").replace(/\./g, "").replace(",", "."))
        : Number(amount)

    try {
        const model = (prisma as any).bankAccountTransaction
        let transaction;
        if (model) {
            transaction = await model.update({
                where: { id, companyId: companyId },
                data: {
                    ...rest,
                    amount: parsedAmount,
                },
            })
        } else {
            throw new Error("Prisma model 'bankAccountTransaction' not found. Please restart the dev server.")
        }

        revalidatePath(`/bank-accounts/${rest.bankAccountId}`)
        return { success: true, transaction: serializePrisma(transaction) }
    } catch (error: any) {
        console.error("Error updating transaction:", error)
        return { success: false, error: error.message || "Failed to update transaction" }
    }
}

export async function deleteTransaction(id: string, bankAccountId: string) {
    const companyId = await getTenant()
    if (!companyId) return { success: false, error: "Unauthorized" }

    try {
        const model = (prisma as any).bankAccountTransaction
        if (model) {
            await model.delete({
                where: { id, companyId: companyId },
            })
        } else {
            await (prisma as any).$executeRawUnsafe(`DELETE FROM "BankAccountTransaction" WHERE "id" = '${id}' AND "companyId" = '${companyId}'`);
        }

        revalidatePath(`/bank-accounts/${bankAccountId}`)
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting transaction:", error)
        return { success: false, error: error.message || "Failed to delete transaction" }
    }
}

export async function getAccountBalance(bankAccountId: string) {
    const companyId = await getTenant()
    if (!companyId) return { success: false, error: "Unauthorized", balance: 0 }

    try {
        const model = (prisma as any).bankAccountTransaction
        let results;
        if (model) {
            results = await model.findMany({
                where: {
                    bankAccountId,
                    companyId: companyId,
                },
                select: {
                    amount: true,
                    type: true,
                }
            })
        } else {
            results = await (prisma as any).$queryRawUnsafe(`SELECT "amount", "type" FROM "BankAccountTransaction" WHERE "bankAccountId" = '${bankAccountId}' AND "companyId" = '${companyId}'`);
        }

        const balance = results.reduce((acc: number, trans: any) => {
            const amount = Number(trans.amount)
            return trans.type === TransactionType.CREDIT ? acc + amount : acc - amount
        }, 0)

        return { success: true, balance }
    } catch (error: any) {
        console.error("Error getting balance:", error)
        return { success: false, error: error.message || "Failed to calculate balance", balance: 0 }
    }
}
