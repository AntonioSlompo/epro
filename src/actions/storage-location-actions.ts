"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { storageLocationSchema } from "@/schemas/storage-location-schema";
import { getTenant } from "./auth-actions";

export async function getStorageLocations({
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
                storageLocations: [],
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
                          { name: { contains: search, mode: "insensitive" as const } },
                          { city: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const [storageLocations, total] = await Promise.all([
            prisma.storageLocation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    vehicle: true,
                },
            }),
            prisma.storageLocation.count({ where }),
        ]);

        return {
            storageLocations,
            totalPages: Math.ceil(total / limit),
            success: true,
        };
    } catch (error) {
        console.error("Error fetching storage locations:", error);
        return {
            storageLocations: [],
            totalPages: 0,
            success: false,
            error: "Erro ao buscar locais de estoque",
        };
    }
}

export async function getStorageLocation(id: string) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return {
                storageLocation: null,
                success: false,
                error: "Sessão não encontrada",
            };
        }

        const storageLocation = await prisma.storageLocation.findUnique({
            where: {
                id,
                companyId: tenantId,
            },
            include: {
                vehicle: true,
            },
        });

        if (!storageLocation) {
            return { success: false, error: "Local de estoque não encontrado" };
        }

        return { success: true, storageLocation };
    } catch (error) {
        console.error("Error fetching storage location:", error);
        return { success: false, error: "Erro ao buscar local de estoque" };
    }
}

export async function upsertStorageLocation(data: z.infer<typeof storageLocationSchema> & { id?: string }) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return { success: false, error: "Sessão não encontrada" };
        }

        const validatedData = storageLocationSchema.parse(data);

        // Clear irrelevant fields based on type
        if (validatedData.type !== "FIXED") {
            validatedData.zip = null;
            validatedData.street = null;
            validatedData.number = null;
            validatedData.complement = null;
            validatedData.neighborhood = null;
            validatedData.city = null;
            validatedData.state = null;
            validatedData.latitude = null;
            validatedData.longitude = null;
        }
        if (validatedData.type !== "MOBILE") {
            validatedData.vehicleId = null;
        }

        const payload = {
            ...validatedData,
            companyId: tenantId,
        };

        let storageLocation;
        if (data.id) {
            storageLocation = await prisma.storageLocation.update({
                where: {
                    id: data.id,
                    companyId: tenantId,
                },
                data: payload,
            });
        } else {
            storageLocation = await prisma.storageLocation.create({
                data: payload,
            });
        }

        revalidatePath("/storage-locations");
        if (data.id) revalidatePath(`/storage-locations/${data.id}/edit`);
        
        return { success: true, storageLocation };
    } catch (error) {
        console.error("Error upserting storage location:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: "Dados inválidos: " + error.issues[0].message };
        }
        return { success: false, error: "Erro ao salvar local de estoque" };
    }
}

export async function deleteStorageLocation(id: string) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) {
            return { success: false, error: "Sessão não encontrada" };
        }

        await prisma.storageLocation.delete({
            where: {
                id,
                companyId: tenantId,
            },
        });

        revalidatePath("/storage-locations");
        return { success: true };
    } catch (error) {
        console.error("Error deleting storage location:", error);
        return { success: false, error: "Erro ao excluir local de estoque" };
    }
}

export async function searchVehicles(query: string) {
    try {
        const tenantId = await getTenant();
        if (!tenantId) return [];

        const vehicles = await prisma.vehicle.findMany({
            where: {
                companyId: tenantId,
                status: "AVAILABLE",
                OR: [
                    { plate: { contains: query, mode: "insensitive" } },
                    { brand: { contains: query, mode: "insensitive" } },
                    { model: { contains: query, mode: "insensitive" } },
                ],
                // Only vehicles NOT already assigned to a storage location (or the one being edited, but we'll filter client-side if needed)
                storageLocation: null,
            },
            take: 10,
        });

        return vehicles;
    } catch (error) {
        console.error("Error searching vehicles:", error);
        return [];
    }
}
