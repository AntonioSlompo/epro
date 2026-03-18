import { z } from "zod";

export const toolSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  serialNumber: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "LOST", "DAMAGED"]).default("AVAILABLE"),
  notes: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

export type ToolFormValues = z.infer<typeof toolSchema>;
