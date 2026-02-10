'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SupplierFormValues, supplierSchema } from "@/schemas/supplier-schema";

export async function getSuppliers({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;
    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    } : {};

    try {
        const [suppliers, total] = await prisma.$transaction([
            prisma.supplier.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.supplier.count({ where }),
        ]);

        return { suppliers, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw new Error("Failed to fetch suppliers"); // Or return empty state
    }
}

export async function getSupplierById(id: string) {
    try {
        const supplier = await prisma.supplier.findUnique({ where: { id } });
        return supplier;
    } catch (error) {
        console.error("Error fetching supplier:", error);
        return null;
    }
}

export async function createSupplier(data: SupplierFormValues) {
    const result = supplierSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    try {
        await prisma.supplier.create({ data: result.data });
        revalidatePath('/suppliers');
        return { success: true };
    } catch (error) {
        console.error("Error creating supplier:", error);
        return { success: false, error: "Failed to create supplier" };
    }
}

export async function updateSupplier(id: string, data: SupplierFormValues) {
    const result = supplierSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    try {
        const { id: _, ...updateData } = result.data;
        await prisma.supplier.update({ where: { id }, data: updateData });
        revalidatePath('/suppliers');
        revalidatePath(`/suppliers/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating supplier:", error);
        return { success: false, error: "Failed to update supplier" };
    }
}

export async function deleteSupplier(id: string) {
    try {
        await prisma.supplier.delete({ where: { id } });
        revalidatePath('/suppliers');
        return { success: true };
    } catch (error) {
        console.error("Error deleting supplier:", error);
        return { success: false, error: "Failed to delete supplier" };
    }
}
