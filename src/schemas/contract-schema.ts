import { z } from "zod";
import { ContractStatus } from "@prisma/client";

export const contractItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "O produto/serviço é obrigatório"),
  quantity: z.number().min(1, "A quantidade deve ser pelo menos 1"),
  unitPrice: z.number().min(0, "O preço unitário deve ser maior ou igual a zero"),
  discount: z.number(),
  total: z.number(),
  description: z.string().optional().nullable(),
});

export const contractSchema = z.object({
  customerId: z.string().min(1, "O cliente é obrigatório"),
  contractNumber: z.string().min(1, "O número do contrato é obrigatório"),
  status: z.nativeEnum(ContractStatus),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  billingDay: z.number().min(1).max(31, "O dia de faturamento deve ser entre 1 e 31"),
  paymentCondition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(contractItemSchema).min(1, "O contrato deve ter pelo menos um item"),
});

export type ContractFormValues = z.infer<typeof contractSchema>;
export type ContractItemValues = z.infer<typeof contractItemSchema>;
