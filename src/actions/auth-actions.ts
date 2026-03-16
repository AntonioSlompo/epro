'use server';

import { prisma } from "@/lib/prisma";
import { loginSchema, LoginFormValues } from "@/schemas/auth-schema";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/routing";
import { User } from "@prisma/client";
import { mapCompanyToSafe } from "@/lib/utils";

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
        return { success: true, role: user.role };
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
            include: { companies: true }
        });

        if (!user) return null;

        // Strip Uint8Array to avoid Next.js serialization error and add base64
        const safeUser = {
            ...user,
            companies: user.companies.map(mapCompanyToSafe)
        };

        return safeUser as any;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

export async function setTenant(companyId: string) {
    const cookieStore = await cookies();
    // In production, you might want to verify that the current user actually has access to this company before setting the cookie.
    cookieStore.set('tenant_id', companyId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}

export async function getTenant() {
    const cookieStore = await cookies();
    let tenantId = cookieStore.get('tenant_id')?.value;

    if (!tenantId) {
        const user = await getCurrentUser();
        if (user && user.companies && user.companies.length > 0) {
            return user.companies[0].id;
        }
    }

    return tenantId;
}
