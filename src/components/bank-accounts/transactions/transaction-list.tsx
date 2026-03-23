"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react"
import { getTransactions, deleteTransaction } from "@/actions/bank-account-transaction-actions"
import { TransactionDialog } from "./transaction-dialog"
import { TransactionType, TransactionStatus } from "@/schemas/bank-account-transaction-schema"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TransactionListProps {
    bankAccountId: string
}

export function TransactionList({ bankAccountId }: TransactionListProps) {
    const t = useTranslations("BankTransactions")
    const commonT = useTranslations("Common")
    const [transactions, setTransactions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchTransactions = async () => {
        setIsLoading(true)
        const result = await getTransactions({ bankAccountId, limit: 100 })
        if (result.success) {
            setTransactions(result.transactions || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchTransactions()
    }, [bankAccountId])

    const handleDelete = async (id: string) => {
        if (confirm(t("confirmDelete"))) {
            const result = await deleteTransaction(id, bankAccountId)
            if (result.success) {
                toast.success(t("deleteSuccess"))
                fetchTransactions()
            } else {
                toast.error(commonT("error"))
            }
        }
    }

    const formatDate = (date: string | Date) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
                <TransactionDialog 
                    bankAccountId={bankAccountId} 
                    onSuccess={fetchTransactions}
                >
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("addTransaction")}
                    </Button>
                </TransactionDialog>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">{t("date")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("paymentMethod")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead className="text-right">{t("balance")}</TableHead>
                            <TableHead className="text-right">{t("totalAvailable")}</TableHead>
                            <TableHead className="w-[80px] text-center">{t("status")}</TableHead>
                            <TableHead className="w-[100px] text-center">{t("type")}</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                    {commonT("loading")}...
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                    {commonT("noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {formatDate(transaction.date)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{transaction.description}</div>
                                        {transaction.reference && (
                                            <div className="text-xs text-muted-foreground">Ref: {transaction.reference}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {transaction.category || "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {transaction.paymentMethod ? t(`paymentMethods.${transaction.paymentMethod}`) : "-"}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-semibold",
                                        transaction.type === TransactionType.CREDIT ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {transaction.type === TransactionType.CREDIT ? "+" : "-"} 
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right text-xs font-medium",
                                        transaction.runningBalance >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.runningBalance || 0))}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right text-xs font-bold",
                                        transaction.runningAvailable >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.runningAvailable || 0))}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {transaction.status === TransactionStatus.RECONCILED ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-50" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {transaction.type === TransactionType.CREDIT ? (
                                                <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <ArrowDownCircle className="h-5 w-5 text-rose-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{commonT("actions")}</DropdownMenuLabel>
                                                <TransactionDialog 
                                                    bankAccountId={bankAccountId} 
                                                    transaction={transaction}
                                                    onSuccess={fetchTransactions}
                                                >
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        {commonT("edit")}
                                                    </DropdownMenuItem>
                                                </TransactionDialog>
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {commonT("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
