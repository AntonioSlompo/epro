"use server";

import { prisma } from "@/lib/prisma";
import { getTenant } from "./auth-actions";
import { revalidatePath } from "next/cache";

export async function getProducts({ 
    page = 1, 
    limit = 10, 
    search = "" 
}: { 
    page?: number, 
    limit?: number, 
    search?: string 
} = {}) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", products: [], totalPages: 0 };

    try {
        const skip = (page - 1) * limit;

        const where: any = {
            companyId: tenantId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.product.count({ where })
        ]);

        return { 
            success: true, 
            products, 
            totalPages: Math.ceil(total / limit) 
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: "Failed to fetch products.", products: [], totalPages: 0 };
    }
}

export async function getProduct(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized", product: null };

    try {
        const product = await prisma.product.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });
        return { success: true, product };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { success: false, error: "Failed to fetch product." };
    }
}

export async function createProduct(data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        // Enforce uniqueness by company and SKU
        const existing = await prisma.product.findFirst({
            where: {
                companyId: tenantId,
                sku: data.sku
            }
        });
        
        if (existing) {
            return { success: false, error: "Já existe um produto com este SKU (Código)." };
        }

        // Handle image base64s if provided
        let image1Url = data.image1Url;
        let image2Url = data.image2Url;
        let image3Url = data.image3Url;
        
        if (data.image1Base64) image1Url = data.image1Base64;
        if (data.image2Base64) image2Url = data.image2Base64;
        if (data.image3Base64) image3Url = data.image3Base64;

        // Clean up unneeded properties (Base64) before DB
        const dbData = { ...data, companyId: tenantId, image1Url, image2Url, image3Url };
        delete dbData.image1Base64;
        delete dbData.image2Base64;
        delete dbData.image3Base64;

        const newProduct = await prisma.product.create({
            data: dbData
        });

        revalidatePath('/[locale]/(main)/products');
        return { success: true, product: newProduct };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, error: "Failed to create product." };
    }
}

export async function updateProduct(id: string, data: any) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await prisma.product.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Product not found." };
        }
        
        // Handle images
        let image1Url = existing.image1Url;
        let image2Url = existing.image2Url;
        let image3Url = existing.image3Url;
        
        if (data.image1Base64 !== undefined) image1Url = data.image1Base64;
        if (data.image2Base64 !== undefined) image2Url = data.image2Base64;
        if (data.image3Base64 !== undefined) image3Url = data.image3Base64;

        const dbData = { ...data, image1Url, image2Url, image3Url };
        delete dbData.image1Base64;
        delete dbData.image2Base64;
        delete dbData.image3Base64;

        if (data.sku && data.sku !== existing.sku) {
            const duplicateSku = await prisma.product.findFirst({
                where: {
                    companyId: tenantId,
                    sku: data.sku,
                    id: { not: id }
                }
            });
            if (duplicateSku) {
                return { success: false, error: "Já existe um produto com este SKU." };
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: dbData
        });

        revalidatePath('/[locale]/(main)/products');
        revalidatePath(`/[locale]/(main)/products/${id}/edit`);
        return { success: true, product: updatedProduct };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: "Failed to update product." };
    }
}

export async function deleteProduct(id: string) {
    const tenantId = await getTenant();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    try {
        const existing = await prisma.product.findFirst({
            where: {
                id,
                companyId: tenantId,
            }
        });

        if (!existing) {
             return { success: false, error: "Product not found." };
        }
        
        await prisma.product.delete({
            where: { id }
        });

        revalidatePath('/[locale]/(main)/products');
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
