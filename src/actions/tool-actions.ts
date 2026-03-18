"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";
import { type ToolFormValues } from "@/schemas/tool-schema";

export async function getTools({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", tools: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where = {
            companyId: tenantId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { serialNumber: { contains: search, mode: 'insensitive' as const } },
                    { brand: { contains: search, mode: 'insensitive' as const } },
                    { model: { contains: search, mode: 'insensitive' as const } },
                    { category: { contains: search, mode: 'insensitive' as const } },
                ]
            } : {})
        };

        const [tools, total] = await Promise.all([
            (prisma as any).tool.findMany({
                where,
                orderBy: {
                    name: 'asc'
                },
                skip,
                take: limit
            }),
            (prisma as any).tool.count({ where })
        ]);

        return { 
            success: true, 
            tools, 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching tools:", error);
        return { success: false, error: "Failed to fetch tools.", tools: [], totalPages: 0 };
    }
}

export async function getTool(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", tool: null };

    try {
        const tool = await (prisma as any).tool.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });
        return { success: true, tool };
    } catch (error) {
        console.error("Error fetching tool:", error);
        return { success: false, error: "Failed to fetch tool." };
    }
}

export async function createTool(data: ToolFormValues) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const newTool = await (prisma as any).tool.create({
            data: {
                ...data,
                companyId: tenantId
            }
        });

        revalidatePath('/[locale]/(main)/tools');
        return { success: true, tool: newTool };
    } catch (error) {
        console.error("Error creating tool:", error);
        return { success: false, error: "Failed to create tool." };
    }
}

export async function updateTool(id: string, data: Partial<ToolFormValues>) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await (prisma as any).tool.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Tool not found." };
        }

        const updatedTool = await (prisma as any).tool.update({
            where: { id },
            data
        });

        revalidatePath('/[locale]/(main)/tools');
        revalidatePath(`/[locale]/(main)/tools/${id}/edit`);
        return { success: true, tool: updatedTool };
    } catch (error) {
        console.error("Error updating tool:", error);
        return { success: false, error: "Failed to update tool." };
    }
}

export async function deleteTool(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await (prisma as any).tool.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Tool not found." };
        }
        
        await (prisma as any).tool.delete({
            where: { id }
        });

        revalidatePath('/[locale]/(main)/tools');
        return { success: true };
    } catch (error) {
        console.error("Error deleting tool:", error);
        return { success: false, error: "Failed to delete tool." };
    }
}
