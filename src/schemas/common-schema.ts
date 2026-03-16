import { z } from "zod";

export const documentSchema = z.object({
    document: z.string().min(1, "Documento é obrigatório"),
    documentType: z.enum(["CPF", "CNPJ"]),
    stateRegistration: z.string().optional(),
});

export const addressSchema = z.object({
    zip: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});
