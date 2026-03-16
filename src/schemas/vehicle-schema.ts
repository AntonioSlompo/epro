import { z } from "zod";

export const vehicleSchema = z.object({
  plate: z.string().min(1, "Placa é obrigatória"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  yearManufacture: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable(),
  yearModel: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable(),
  color: z.string().nullable(),
  
  renavam: z.string().nullable(),
  chassis: z.string().nullable(),
  fleetNumber: z.string().nullable(),
  
  type: z.enum(["CAR", "MOTORCYCLE", "TRUCK", "VAN", "OTHER"]),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE", "INACTIVE"]),
  fuelType: z.enum(["GASOLINE", "ALCOHOL", "FLEX", "DIESEL", "ELECTRIC", "GNV"]).nullable(),
  
  currentMileage: z.number().int().min(0).nullable(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
