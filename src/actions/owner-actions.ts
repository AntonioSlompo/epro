"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth-actions"
import { z } from "zod"

// Very simple schema for safety
const ownerSchema = z.object({
    name: z.string().min(1, "Razão Social é obrigatória"),
    tradeName: z.string().optional().nullable(),
    cnpj: z.string().min(14, "CNPJ inválido"),
    stateRegistration: z.string().optional().nullable(),
    municipalRegistration: z.string().optional().nullable(),
    email: z.string().email("E-mail inválido").optional().nullable(),
    phone: z.string().optional().nullable(),
    mobile: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    number: z.string().optional().nullable(),
    complement: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    agency: z.string().optional().nullable(),
    account: z.string().optional().nullable(),
    accountType: z.string().optional().nullable(),
    pixKey: z.string().optional().nullable(),
})

export type OwnerData = z.infer<typeof ownerSchema>

export async function getOwner() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Acesso Negado." }
        }

        // There should be only one owner, so we fetch the first one
        const owner = await prisma.owner.findFirst()
        
        return { success: true, data: owner }
    } catch (error) {
        console.error("Error fetching owner:", error)
        return { success: false, error: "Erro ao buscar dados do proprietário." }
    }
}

export async function upsertOwner(data: OwnerData) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Acesso Negado." }
        }

        const parsed = ownerSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: "Dados inválidos." }
        }

        const cleanCnpj = parsed.data.cnpj.replace(/\D/g, '')

        // Check if there's already an owner
        const existingOwner = await prisma.owner.findFirst()

        let result;

        if (existingOwner) {
            // Update
            result = await prisma.owner.update({
                where: { id: existingOwner.id },
                data: { ...parsed.data, cnpj: cleanCnpj },
            })
        } else {
            // Create
            result = await prisma.owner.create({
                data: { ...parsed.data, cnpj: cleanCnpj },
            })
        }

        return { success: true, data: result }
    } catch (error) {
        console.error("Error upserting owner:", error)
        return { success: false, error: "Erro ao salvar dados do proprietário." }
    }
}
