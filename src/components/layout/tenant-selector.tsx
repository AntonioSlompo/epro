"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { setTenant } from "@/actions/auth-actions"

interface CompanyItem {
    id: string
    name: string
    tradeName?: string | null
    logoBase64?: string
    logoUrl?: string | null
}

interface TenantSelectorProps {
    companies: CompanyItem[]
    currentTenantId?: string
    isCollapsed?: boolean
}

export function TenantSelector({ companies, currentTenantId, isCollapsed }: TenantSelectorProps) {
    const t = useTranslations("Dashboard.tenantSelector")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    if (!companies || companies.length === 0) return null

    const handleValueChange = (companyId: string) => {
        startTransition(async () => {
            await setTenant(companyId)
            router.refresh()
        })
    }

    const activeCompany = currentTenantId 
        ? companies.find(c => c.id === currentTenantId) || companies[0]
        : companies[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isPending}
                    className={cn(
                        "w-full justify-between h-10 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all",
                        isCollapsed && "justify-center px-0 bg-transparent border-transparent hover:bg-white/5"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <div className={cn("rounded-md overflow-hidden h-8 w-8 bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center", isCollapsed && "h-10 w-10 p-0 bg-transparent border-transparent")}>
                            {activeCompany.logoUrl || (activeCompany as any).logoBase64 ? (
                                <img src={activeCompany.logoUrl || (activeCompany as any).logoBase64} alt={activeCompany.name} className="h-full w-full object-contain p-0.5" />
                            ) : (
                                <Building2 className={cn("h-4 w-4 text-primary", isCollapsed && "h-6 w-6")} />
                            )}
                        </div>
                        {!isCollapsed && (
                            <span className="truncate">{activeCompany.tradeName || activeCompany.name}</span>
                        )}
                    </div>
                    {!isCollapsed && <ChevronDown className="h-3 w-3 opacity-50" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[20rem] md:w-[30rem] bg-background/95 backdrop-blur-sm border-border ml-2">
                <DropdownMenuLabel>{t("selectCompany")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.map((company) => (
                    <DropdownMenuItem
                        key={company.id}
                        className="gap-3 cursor-pointer"
                        onClick={() => handleValueChange(company.id)}
                    >
                        <div className="h-8 w-8 rounded-md overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                            {company.logoUrl || (company as any).logoBase64 ? (
                                <img src={company.logoUrl || (company as any).logoBase64} alt={company.name} className="h-full w-full object-contain p-0.5" />
                            ) : (
                                <Building2 className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <span className="truncate">{company.tradeName || company.name}</span>
                        {activeCompany.id === company.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
