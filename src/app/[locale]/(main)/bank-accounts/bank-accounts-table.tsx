"use client"

import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { useBankAccountColumns } from "./columns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Pencil, Trash2, Landmark, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { deleteBankAccount } from "@/actions/bank-account-actions"
import { toast } from "sonner"
import { useTransition } from "react"

interface BankAccountsTableProps {
    data: any[]
    totalPages: number
    page: number
    viewMode?: 'list' | 'card'
}

export function BankAccountsTable({ data, totalPages, page, viewMode = 'list' }: BankAccountsTableProps) {
    const t = useTranslations("Common")
    const tAcct = useTranslations("BankAccounts")
    const transT = useTranslations("BankTransactions")
    const columns = useBankAccountColumns()
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string) => {
        if (confirm(tAcct("deleteConfirm") || "Tem certeza que deseja excluir?")) {
            startTransition(async () => {
                const result = await deleteBankAccount(id);
                if (result.success) {
                    toast.success(tAcct("deleteSuccess") || "Excluído com sucesso!");
                } else {
                    toast.error(result.error || "Erro ao excluir");
                }
            });
        }
    }

    if (viewMode === 'list') {
        return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} />
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.map((account) => (
                    <Card key={account.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                        <CardContent className="p-0 flex flex-col h-full">
                            {/* Header */}
                            <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0 p-1">
                                    {account.bank?.logo ? (
                                        <img src={account.bank.logo} alt={account.bank.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Landmark className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-semibold truncate" title={account.bank?.name}>{account.bank?.name || "N/A"}</h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {account.type}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground" disabled={isPending}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/bank-accounts/${account.id}/edit`} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(account.id)} className="text-destructive focus:text-destructive cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Body */}
                            <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center text-muted-foreground gap-2">
                                        <span className="font-medium text-xs uppercase tracking-wider">{tAcct("form.agency")}:</span>
                                        <span>{account.agency}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground gap-2">
                                        <span className="font-medium text-xs uppercase tracking-wider">{tAcct("form.number")}:</span>
                                        <span>{account.number}</span>
                                    </div>
                                    {account.openingDate && (
                                        <div className="flex items-center text-muted-foreground gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-xs">{new Date(account.openingDate).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2 border-t pt-3 mt-1">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground uppercase">{transT("balance")}</span>
                                            <span className={`font-semibold ${account.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground uppercase">{tAcct("form.limit")}</span>
                                            <span className="font-medium text-muted-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.limit || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-1 mt-1">
                                            <span className="text-xs font-bold uppercase">{transT("totalAvailable")}</span>
                                            <span className={`font-bold ${account.totalAvailable >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.totalAvailable || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-2 flex flex-wrap gap-2 justify-between items-center">
                                    <Badge variant={account.active ? "default" : "secondary"} className="font-normal text-xs">
                                        {account.active ? t("status.active") : t("status.inactive")}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination for Card View */}
            {totalPages > 1 && (
                <div className="pt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                    </p>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                            <Link href={`/bank-accounts?page=${page - 1}${viewMode ? `&view=${viewMode}` : ''}`}>Anterior</Link>
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                            <Link href={`/bank-accounts?page=${page + 1}${viewMode ? `&view=${viewMode}` : ''}`}>Próxima</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
