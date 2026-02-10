import { z } from "zod";

export const addressSchema = z.object({
    zip: z.string().min(8, "CEP inválido").max(9, "CEP inválido"), // 12345678 or 12345-678
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "UF inválida"),
    latitude: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().optional()
    ).optional(),
    longitude: z.preprocess(
        (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
        z.number().optional()
    ).optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
