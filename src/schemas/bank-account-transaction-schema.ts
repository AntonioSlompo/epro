import { z } from "zod";

// Manually define enums to avoid runtime errors if Prisma client is not perfectly in sync
export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  RECONCILED = 'RECONCILED'
}

export const bankAccountTransactionSchema = z.object({
  id: z.string().optional(),
  bankAccountId: z.string().min(1, "Bank account is required"),
  date: z.any().transform((val) => {
    if (val instanceof Date) return val;
    if (typeof val === 'string') return new Date(val);
    return new Date();
  }),
  description: z.string().min(1, "Description is required"),
  amount: z.union([z.string(), z.number()]),
  type: z.nativeEnum(TransactionType),
  paymentMethod: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDING),
});

export type BankAccountTransactionFormValues = z.infer<typeof bankAccountTransactionSchema>;
