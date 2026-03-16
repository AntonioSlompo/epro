import { z } from "zod";

export const technicianSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  document: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  active: z.boolean().default(true),
  userId: z.string().nullable().optional(),
});

export type TechnicianFormValues = z.infer<typeof technicianSchema>;
