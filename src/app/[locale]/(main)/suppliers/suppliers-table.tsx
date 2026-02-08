"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@prisma/client"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { deleteSupplier } from "@/actions/supplier-actions"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

interface SuppliersTableProps {
    data: Supplier[]
    totalPages: number
    page: number
}

export function SuppliersTable({ data, totalPages, page }: SuppliersTableProps) {
    const t = useTranslations("Common")
    const tSuppliers = useTranslations("Suppliers")

    const columns = useMemo<ColumnDef<Supplier>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t("name")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "email",
            header: t("email"),
        },
        {
            accessorKey: "phone",
            header: t("phone"),
        },
        {
            accessorKey: "active",
            header: t("status.active"),
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? t("status.active") : t("status.inactive")}</Badge>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const supplier = row.original

                const handleDelete = async () => {
                    if (confirm(t("confirmDelete"))) {
                        await deleteSupplier(supplier.id);
                    }
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(supplier.id)}
                            >
                                {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/suppliers/${supplier.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [t])

    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} />
}
