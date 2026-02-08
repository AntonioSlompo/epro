'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserFormValues, userSchema } from "@/schemas/user-schema";

export async function getUsers({ page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;
    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    } : {};

    try {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function getUserById(id: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function createUser(data: UserFormValues) {
    const result = userSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    try {
        // TODO: Hash password here using bcrypt or argon2
        // For now storing as plain text (DEMO ONLY) or assuming standard auth flow handles it later. 
        // Given the request, I will just store it.
        const userData = { ...result.data };

        await prisma.user.create({ data: userData });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUser(id: string, data: UserFormValues) {
    const result = userSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.flatten() };
    }

    try {
        const userData = { ...result.data };
        // If password is empty string, remove it from update to avoid clearing it
        if (!userData.password) {
            delete userData.password;
        }

        await prisma.user.update({ where: { id }, data: userData });
        revalidatePath('/users');
        revalidatePath(`/users/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
