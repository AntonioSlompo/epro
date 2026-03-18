import { z } from "zod";
import { addressSchema } from "./address-schema";

export const storageLocationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  type: z.enum(["FIXED", "MOBILE", "VIRTUAL"]),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED_MOVEMENT"]),
  
  // Fixed type fields
  zip: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  latitude: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().optional()
  ).optional().nullable(),
  longitude: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().optional()
  ).optional().nullable(),

  // Mobile type fields
  vehicleId: z.string().optional().nullable(),
}).refine((data) => {
  if (data.type === "FIXED") {
    return !!data.zip && !!data.street && !!data.number && !!data.neighborhood && !!data.city && !!data.state;
  }
  return true;
}, {
  message: "Endereço completo é obrigatório para locais fixos",
  path: ["zip"], // Point to zip as a representative field
}).refine((data) => {
  if (data.type === "MOBILE") {
    return !!data.vehicleId;
  }
  return true;
}, {
  message: "Veículo é obrigatório para locais móveis",
  path: ["vehicleId"],
});

export type StorageLocationFormValues = z.infer<typeof storageLocationSchema>;
