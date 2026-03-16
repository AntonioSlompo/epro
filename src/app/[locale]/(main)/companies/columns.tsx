"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Company } from "@prisma/client"
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
import { deleteCompany } from "@/actions/company-actions"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

export const useCompanyColumns = () => {
    const t = useTranslations("Companies")
    const tCommon = useTranslations("Common")

    const columns: ColumnDef<Company>[] = [
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
            cell: ({ row }) => {
                const company = row.original as any;
                const logo = company.logoUrl || company.logoBase64;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                            {logo ? (
                                <img src={logo} alt={company.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs text-muted-foreground uppercase">{company.name.substring(0, 2)}</span>
                            )}
                        </div>
                        <span className="font-medium truncate max-w-[200px]" title={company.name}>{company.name}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "tradeName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t("tradeName")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "cnpj",
            header: "CNPJ",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "active",
            header: t("status"),
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? tCommon("status.active") : tCommon("status.inactive")}</Badge>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const company = row.original

                const handleDelete = async () => {
                    if (confirm(tCommon("confirmDelete"))) {
                        await deleteCompany(company.id);
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
                            <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(company.id)}
                            >
                                {tCommon("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/companies/${company.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {tCommon("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> {tCommon("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return columns;
}
