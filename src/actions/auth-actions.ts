'use server';

import { prisma } from "@/lib/prisma";
import { loginSchema, LoginFormValues } from "@/schemas/auth-schema";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/routing";
import { User } from "@prisma/client";

export async function login(data: LoginFormValues) {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        console.log("Login Schema Error:", result.error);
        return { success: false, error: "Invalid input" };
    }

    const { email, password } = result.data;
    console.log("Attempting login for:", email);

    try {
        const user = await prisma.user.findUnique({ where: { email } }) as User | null;

        if (!user) {
            console.log("User not found");
            return { success: false, error: "Invalid credentials" };
        }

        if (!user.active) {
            console.log("User inactive");
            return { success: false, error: "Account is disabled" };
        }

        console.log("User found, checking password...");
        // For DEMO purposes, check if password matches directly OR if user has no password set (first login?) allowed.
        // In a real app: await bcrypt.compare(password, user.password)
        const dbUser = user as any;
        if (dbUser.password && dbUser.password !== password) {
            console.log("Password mismatch. DB:", dbUser.password, "Input:", password);
            return { success: false, error: "Invalid credentials" };
        }

        // Create session
        // In a real app, use a library like auth.js or set a signed JWT in HTTP-only cookie.
        // Here we'll set a simple cookie for demo state.
        const cookieStore = await cookies();
        cookieStore.set('session_userId', user.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        console.log("Login successful");
        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Something went wrong" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session_userId');
    redirect({ href: '/', locale: 'pt' });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_userId')?.value;

    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return user as any;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}
