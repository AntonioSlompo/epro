import { z } from "zod";

const optionalString = z.string().optional().or(z.literal(""));

export const entitySchema = z.object({
    id: z.string().optional(),
    
    // Type Flags
    isCustomer: z.boolean().default(false),
    isSupplier: z.boolean().default(false),
    active: z.boolean().default(true),

    // Fiscal Data
    documentType: z.enum(["CPF", "CNPJ"]).default("CNPJ"),
    document: z.string().min(1, "Documento é obrigatório"),
    name: z.string().min(1, "Nome/Razão Social é obrigatório"),
    tradeName: optionalString,
    stateRegistration: optionalString,
    municipalRegistration: optionalString,
    birthDateOrFoundation: z.date().optional().nullable(),

    // Contact Data
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: optionalString,
    mobile: optionalString,
    website: optionalString.refine((val) => !val || /^https?:\/\//.test(val), "Website deve começar com http:// ou https://").optional().or(z.literal("")),

    // Address Data
    zip: optionalString,
    street: optionalString,
    number: optionalString,
    complement: optionalString,
    neighborhood: optionalString,
    city: optionalString,
    state: optionalString,
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    referencePoint: optionalString,
    operatingHours: optionalString, // Conditionally meaningful, but structurally just a string

    // Banking Data
    bankName: optionalString,
    agency: optionalString,
    account: optionalString,
    accountType: optionalString,
    pixKey: optionalString,

    // Financial Data (Conditional UI side mostly, but validation logic could be here)
    creditLimit: z.number().optional().nullable(),
    standardPaymentCondition: optionalString,
    responsibleConsultant: optionalString,
}).refine(data => data.isCustomer || data.isSupplier, {
    message: "A entidade deve ser Cliente, Fornecedor ou ambos.",
    path: ["isCustomer"],
});

export type EntityFormValues = z.infer<typeof entitySchema>;
