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

export const supplierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Razão Social é obrigatória"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    active: z.boolean().default(true),
}).merge(documentSchema).merge(addressSchema);

export type SupplierFormValues = z.infer<typeof supplierSchema>;
