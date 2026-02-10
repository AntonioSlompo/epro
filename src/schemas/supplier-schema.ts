import { z } from "zod";
import { documentSchema } from "./document-schema";
import { addressSchema } from "./address-schema";

export const supplierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"), // Razão Social
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    active: z.boolean().default(true),
}).merge(documentSchema).merge(addressSchema);

export type SupplierFormValues = z.infer<typeof supplierSchema>;
