"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Landmark } from "lucide-react"
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
import { deleteBankAccount } from "@/actions/bank-account-actions"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

export const useBankAccountColumns = () => {
    const t = useTranslations("BankAccounts")
    const tCommon = useTranslations("Common")
    const transT = useTranslations("BankTransactions")

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "bank.name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    {t("form.bank")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const bank = row.original.bank;
                return (
                    <div className="flex items-center gap-2 pl-4">
                        <div className="h-8 w-8 rounded overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                            {bank?.logo ? (
                                <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                <Landmark className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                        <span className="font-medium">{bank?.name || "N/A"}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "type",
            header: t("form.type"),
            cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>
        },
        {
            accessorKey: "agency",
            header: t("form.agency"),
        },
        {
            accessorKey: "number",
            header: t("form.number"),
        },
        {
            accessorKey: "balance",
            header: transT("balance"),
            cell: ({ row }) => {
                const balance = Number(row.original.balance || 0);
                return (
                    <div className={cn(
                        "font-medium",
                        balance >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                    </div>
                );
            }
        },
        {
            accessorKey: "limit",
            header: t("form.limit"),
            cell: ({ row }) => {
                const limit = Number(row.original.limit || 0);
                return (
                    <div className="font-medium text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(limit)}
                    </div>
                );
            }
        },
        {
            accessorKey: "totalAvailable",
            header: transT("totalAvailable"),
            cell: ({ row }) => {
                const total = Number(row.original.totalAvailable || 0);
                return (
                    <div className={cn(
                        "font-bold",
                        total >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </div>
                );
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
                const account = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [isPending, startTransition] = useTransition()

                const handleDelete = async () => {
                    if (confirm(t("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                        startTransition(async () => {
                             const result = await deleteBankAccount(account.id);
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
                                <Link href={`/bank-accounts/${account.id}`} className="flex items-center cursor-pointer">
                                    <Landmark className="mr-2 h-4 w-4" /> {tCommon("details") || "Detalhes"}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/bank-accounts/${account.id}/edit`} className="flex items-center cursor-pointer">
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
