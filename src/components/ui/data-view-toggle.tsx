"use client"

import { Button } from "@/components/ui/button"
import { List, Grid2X2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function DataViewToggle() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    
    // Default to 'list'
    const currentView = searchParams.get('view') || 'list'

    const setView = (view: 'list' | 'card') => {
        const params = new URLSearchParams(searchParams)
        if (view === 'list') {
            params.delete('view') // keep url clean
        } else {
            params.set('view', view)
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center rounded-md border border-border/50 bg-background/50 backdrop-blur-sm p-0.5">
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-sm ${currentView === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setView('list')}
                title="List View"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-sm ${currentView === 'card' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setView('card')}
                title="Card View"
            >
                <Grid2X2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
