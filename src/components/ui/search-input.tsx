"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { useTranslations } from "next-intl"

export function SearchInput() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const t = useTranslations("Common") // Assuming a Common namespace or similar, defaults to placeholder if not found

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        // Reset page to 1 when searching
        params.delete('page')

        replace(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <div className="relative w-full max-w-3xl">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Pesquisar..."
                className="pl-9 bg-background/50 border-white/10 focus:border-primary/50"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
        </div>
    )
}
