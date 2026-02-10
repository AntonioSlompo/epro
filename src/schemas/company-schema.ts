import { z } from "zod";
import { documentSchema, addressSchema } from "./supplier-schema";

// Helper for optional fields that might come as empty strings from forms
const optionalString = z.string().optional().or(z.literal(""));

export const companySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Razão Social é obrigatória"),
    slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
    tradeName: optionalString,

    // Contact
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: optionalString,
    mobile: optionalString,
    whatsapp: optionalString,
    website: optionalString.refine((val) => !val || /^https?:\/\//.test(val), "Website deve começar com http:// ou https://"),

    // Plan & Subs
    planId: optionalString,
    distributionModel: z.enum(["LIVRE", "RESTRITO"]).default("LIVRE"),
    portalMode: z.enum(["LISTING", "CATALOG"]).default("LISTING"),
    enableCommissionControl: z.boolean().default(true),
    active: z.boolean().default(true),

    logoUrl: optionalString,
})
    .merge(documentSchema) // Adds cnpj, stateRegistration, etc.
    .merge(addressSchema); // Adds zip, street, etc.

export type CompanyFormValues = z.infer<typeof companySchema>;
