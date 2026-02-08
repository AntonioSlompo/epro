"use client"

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface TablePaginationProps {
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export function TablePagination({
    totalPages,
    hasNextPage,
    hasPrevPage,
}: TablePaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentPage = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("limit")) || 10

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }

    const setPage = (page: number) => {
        router.push(pathname + "?" + createQueryString("page", page.toString()))
    }

    const setPageSize = (size: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", size)
        params.set("page", "1") // Reset to page 1
        router.push(pathname + "?" + params.toString())
    }

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground hidden md:block">
                Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium hidden sm:block">Linhas por página</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value: string) => setPageSize(value)}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(1)}
                        disabled={!hasPrevPage}
                    >
                        <span className="sr-only">Primeira página</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(currentPage - 1)}
                        disabled={!hasPrevPage}
                    >
                        <span className="sr-only">Página anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium md:hidden">
                        Pág {currentPage} de {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(currentPage + 1)}
                        disabled={!hasNextPage}
                    >
                        <span className="sr-only">Próxima página</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => setPage(totalPages)}
                        disabled={!hasNextPage}
                    >
                        <span className="sr-only">Última página</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
