"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Building2 } from "lucide-react"
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
import { deleteBank } from "@/actions/bank-actions"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useTransition } from "react"

export const useBankColumns = () => {
    const t = useTranslations("Banks")
    const tCommon = useTranslations("Common")

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "code",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t("form.code")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <span className="font-mono font-medium pl-4">{row.original.code}</span>
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t("form.name")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const bank = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                            {bank.logo ? (
                                <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[300px]" title={bank.name}>{bank.name}</span>
                            {bank.nickname && (
                                <span className="text-xs text-muted-foreground">{bank.nickname}</span>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? tCommon("status.active") : tCommon("status.inactive")}</Badge>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const bank = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [isPending, startTransition] = useTransition()

                const handleDelete = async () => {
                    if (confirm(t("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                        startTransition(async () => {
                             const result = await deleteBank(bank.id);
                             if (result.success) {
                                  toast.success(t("deleteSuccess") || "Excluído com sucesso!");
                             } else {
                                  toast.error(result.error || "Erro ao excluir");
                             }
                        });
                    }
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/banks/${bank.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {tCommon("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
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
