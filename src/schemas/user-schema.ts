import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    image: z.string().optional(), // Base64 string
    active: z.boolean().default(true),
    // Password validation: Optional on edit if not changing, required on create
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userSchema>;
