"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Shield, Wrench, FileText, DollarSign, Users, LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export interface DashboardContextType {
    id: string
    title: string
    description?: string
    icon: LucideIcon
    color: string
    bg: string
    selectedColor: string
    selectedBg: string
    selectedBorder: string
    selectedShadow: string
    hoverBorder: string
    hoverShadow: string
}

interface DashboardContextState {
    selectedContext: DashboardContextType
    setSelectedContext: (context: DashboardContextType) => void
    contexts: DashboardContextType[]
}

const DashboardContext = createContext<DashboardContextState | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
    const t = useTranslations("Dashboard.context")

    const contexts: DashboardContextType[] = [
        {
            id: 'operational',
            title: t('operational'),
            description: t('operationalDesc'),
            icon: Shield,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            selectedColor: "text-blue-500",
            selectedBg: "bg-blue-500/5",
            selectedBorder: "border-blue-500",
            selectedShadow: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]",
            hoverBorder: "hover:border-blue-500/50",
            hoverShadow: "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
        },
        {
            id: 'maintenance',
            title: t('maintenance'),
            description: t('maintenanceDesc'),
            icon: Wrench,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            selectedColor: "text-orange-500",
            selectedBg: "bg-orange-500/5",
            selectedBorder: "border-orange-500",
            selectedShadow: "shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]",
            hoverBorder: "hover:border-orange-500/50",
            hoverShadow: "hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]"
        },
        {
            id: 'commercial',
            title: t('commercial'),
            description: t('commercialDesc'),
            icon: FileText,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            selectedColor: "text-purple-500",
            selectedBg: "bg-purple-500/5",
            selectedBorder: "border-purple-500",
            selectedShadow: "shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]",
            hoverBorder: "hover:border-purple-500/50",
            hoverShadow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]"
        },
        {
            id: 'financial',
            title: t('financial'),
            description: t('financialDesc'),
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            selectedColor: "text-green-500",
            selectedBg: "bg-green-500/5",
            selectedBorder: "border-green-500",
            selectedShadow: "shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)]",
            hoverBorder: "hover:border-green-500/50",
            hoverShadow: "hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)]"
        },
        {
            id: 'hr',
            title: t('hr'),
            description: t('hrDesc'),
            icon: Users,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            selectedColor: "text-pink-500",
            selectedBg: "bg-pink-500/5",
            selectedBorder: "border-pink-500",
            selectedShadow: "shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)]",
            hoverBorder: "hover:border-pink-500/50",
            hoverShadow: "hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)]"
        }
    ]

    const [selectedContext, setSelectedContext] = useState<DashboardContextType>(contexts[0])

    return (
        <DashboardContext.Provider value={{ selectedContext, setSelectedContext, contexts }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}
