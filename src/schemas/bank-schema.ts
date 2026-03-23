import { z } from "zod";

export const bankSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  nickname: z.string().optional(),
  logo: z.string().optional(),
  active: z.boolean().default(true),
  companyId: z.string().optional(),
});

export type BankFormValues = z.infer<typeof bankSchema>;
