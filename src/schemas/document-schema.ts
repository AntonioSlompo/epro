import { z } from "zod";
import { isValidCNPJ, isValidCPF } from "@/lib/validators";

export const documentSchema = z.object({
    documentType: z.enum(["CPF", "CNPJ"]),
    document: z.string().superRefine((val, ctx) => {
        const clean = val.replace(/\D/g, '');
        const type = ctx.path[0] === 'document' ? (clean.length > 11 ? 'CNPJ' : 'CPF') : 'UNKNOWN';
        // Logic to check against documentType field if available in parent schema, 
        // but here we validate based on the value itself or rely on the form state.

        if (clean.length === 11) {
            if (!isValidCPF(clean)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CPF inválido",
                });
            }
        } else if (clean.length === 14) {
            if (!isValidCNPJ(clean)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "CNPJ inválido",
                });
            }
        } else {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Documento inválido. Deve ser CPF (11 dígitos) ou CNPJ (14 dígitos).",
            });
        }
    }),
    legalName: z.string().optional(), // Razão Social
    tradeName: z.string().optional(), // Nome Fantasia
    stateRegistration: z.string().optional(), // Inscrição Estadual
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
