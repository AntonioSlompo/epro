"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { TablePagination } from "./table-pagination";

import { useState } from "react"
import { List, Grid2X2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount?: number
    totalPages?: number
    page?: number
    renderCard?: (row: TData) => React.ReactNode
    viewMode?: 'list' | 'card'
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    totalPages = 1,
    page = 1,
    renderCard,
    viewMode = 'list',
}: DataTableProps<TData, TValue>) {
    const t = useTranslations("Common")
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        pageCount: pageCount ?? -1,
    })

    return (
        <div className="flex flex-col h-full space-y-4">
            {viewMode === 'list' ? (
                <div className="flex-1 rounded-md border border-border/50 bg-card/40 backdrop-blur-sm overflow-auto relative">
                <Table>
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-muted-foreground whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-border/50 hover:bg-muted/30"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t('noResults')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    {table.getRowModel().rows?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {table.getRowModel().rows.map((row) => (
                                <div key={row.id} className="h-full">
                                    {renderCard!(row.original)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-32 items-center justify-center rounded-md border border-border/50 bg-card/40 backdrop-blur-sm text-muted-foreground">
                            {t('noResults')}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-auto pt-2">
                <TablePagination
                    totalPages={totalPages}
                    hasNextPage={page < totalPages}
                    hasPrevPage={page > 1}
                />
            </div>
        </div>
    )
}
