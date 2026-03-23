"use client"

import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Box, History } from "lucide-react"

export function InventoryTabToggle({ 
    balancesLabel, 
    historyLabel 
}: { 
    balancesLabel: string, 
    historyLabel: string 
}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    
    const currentTab = searchParams.get('tab') || 'balances'

    const setTab = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tabId)
        params.set('page', '1')
        replace(`${pathname}?${params.toString()}`)
    }

    const tabs = [
        { id: 'balances', label: balancesLabel, icon: Box },
        { id: 'transactions', label: historyLabel, icon: History }
    ]

    return (
        <div className="flex items-center rounded-md border border-border/50 bg-background/50 backdrop-blur-sm p-0.5 shrink-0">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = currentTab === tab.id
                
                return (
                    <Button
                        key={tab.id}
                        variant="ghost"
                        size="sm"
                        className={`h-8 gap-2 px-3 rounded-sm transition-all duration-200 ${
                            isActive 
                                ? 'bg-primary/20 text-primary shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        onClick={() => setTab(tab.id)}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{tab.label}</span>
                    </Button>
                )
            })}
        </div>
    )
}
