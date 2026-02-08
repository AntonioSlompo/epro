import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    active: z.boolean().default(true),
    address: z.string().optional(),
    city: z.string().optional(),
    zip: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
