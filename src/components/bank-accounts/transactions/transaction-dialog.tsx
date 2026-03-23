"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TransactionForm } from "./transaction-form"

interface TransactionDialogProps {
    bankAccountId: string
    transaction?: any
    children: React.ReactNode
    onSuccess?: () => void
}

export function TransactionDialog({ 
    bankAccountId, 
    transaction, 
    children, 
    onSuccess 
}: TransactionDialogProps) {
    const t = useTranslations("BankTransactions")
    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        setOpen(false)
        onSuccess?.()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {transaction ? t("editTransaction") : t("addTransaction")}
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os dados da movimentação abaixo.
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm 
                    bankAccountId={bankAccountId} 
                    transaction={transaction}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
