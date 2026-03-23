import { z } from "zod";

export const bankAccountSchema = z.object({
  id: z.string().optional(),
  bankId: z.string().min(1, "O banco é obrigatório"),
  agency: z.string().min(1, "A agência é obrigatória"),
  type: z.string().min(1, "O tipo de conta é obrigatório"), // Corrente, Poupança, etc.
  number: z.string().min(1, "O número da conta é obrigatório"),
  limit: z.union([z.string(), z.number()]).optional().default(0),
  openingDate: z.date().optional().nullable(),
  closingDate: z.date().optional().nullable(),
  active: z.boolean().default(true),
  companyId: z.string().optional(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
