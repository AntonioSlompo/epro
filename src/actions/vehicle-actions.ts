"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vehicleSchema } from "@/schemas/vehicle-schema";
import { getTenant } from "./auth-actions";

export async function getVehicles({
    page = 1,
    limit = 10,
    search = "",
}: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return {
                vehicles: [],
                totalPages: 0,
                success: false,
                error: "Sessão não encontrada",
            };
        }

        const skip = (page - 1) * limit;
        
        const where = {
            companyId: tenantId,
            ...(search
                ? {
                      OR: [
                          { plate: { contains: search, mode: "insensitive" as const } },
                          { brand: { contains: search, mode: "insensitive" as const } },
                          { model: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.vehicle.count({ where }),
        ]);

        return {
            vehicles,
            totalPages: Math.ceil(total / limit),
            success: true,
        };
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return {
            vehicles: [],
            totalPages: 0,
            success: false,
            error: "Erro ao buscar veículos",
        };
    }
}

export async function getVehicle(id: string) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return {
                vehicle: null,
                success: false,
                error: "Sessão não encontrada",
            };
        }

        const vehicle = await prisma.vehicle.findUnique({
            where: {
                id,
                companyId: tenantId,
            },
        });

        if (!vehicle) {
            return { success: false, error: "Veículo não encontrado" };
        }

        return { success: true, vehicle };
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return { success: false, error: "Erro ao buscar veículo" };
    }
}

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return { success: false, error: "Sessão não encontrada" };
        }

        const validatedData = vehicleSchema.parse(data);

        // Check if plate already exists in this company
        const existingVehicle = await prisma.vehicle.findFirst({
            where: {
                companyId: tenantId,
                plate: validatedData.plate,
            },
        });

        if (existingVehicle) {
            return {
                success: false,
                error: "Já existe um veículo com esta placa na sua empresa",
            };
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                ...validatedData,
                companyId: tenantId,
            },
        });

        revalidatePath("/vehicles");
        return { success: true, vehicle };
    } catch (error) {
        console.error("Error creating vehicle:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Dados inválidos" };
        }
        return { success: false, error: "Erro ao criar veículo" };
    }
}

export async function updateVehicle(id: string, data: z.infer<typeof vehicleSchema>) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return { success: false, error: "Sessão não encontrada" };
        }

        const validatedData = vehicleSchema.parse(data);

        // Check if changing plate to one that already exists
        const existingVehicle = await prisma.vehicle.findFirst({
            where: {
                companyId: tenantId,
                plate: validatedData.plate,
                id: { not: id },
            },
        });

        if (existingVehicle) {
            return {
                success: false,
                error: "Já existe outro veículo com esta placa na sua empresa",
            };
        }

        const vehicle = await prisma.vehicle.update({
            where: {
                id,
                companyId: tenantId,
            },
            data: validatedData,
        });

        revalidatePath("/vehicles");
        revalidatePath(`/vehicles/${id}/edit`);
        return { success: true, vehicle };
    } catch (error) {
        console.error("Error updating vehicle:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Dados inválidos" };
        }
        return { success: false, error: "Erro ao atualizar veículo" };
    }
}

export async function deleteVehicle(id: string) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return { success: false, error: "Sessão não encontrada" };
        }

        await prisma.vehicle.delete({
            where: {
                id,
                companyId: tenantId,
            },
        });

        revalidatePath("/vehicles");
        return { success: true };
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return { success: false, error: "Erro ao excluir veículo" };
    }
}
