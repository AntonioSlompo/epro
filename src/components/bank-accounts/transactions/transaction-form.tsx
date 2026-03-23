"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
// @ts-ignore
import { MoneyInput } from "@/components/ui/money-input"
import { 
    bankAccountTransactionSchema, 
    TransactionType,
    TransactionStatus
} from "@/schemas/bank-account-transaction-schema"
import { Switch } from "@/components/ui/switch"
import { createTransaction, updateTransaction } from "@/actions/bank-account-transaction-actions"
import { toast } from "sonner"
import { useState } from "react"

interface TransactionFormProps {
    bankAccountId: string
    transaction?: any
    onSuccess?: () => void
    onCancel?: () => void
}

export function TransactionForm({ 
    bankAccountId, 
    transaction, 
    onSuccess, 
    onCancel 
}: TransactionFormProps) {
    const t = useTranslations("BankTransactions")
    const commonT = useTranslations("Common")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<any>({
        resolver: zodResolver(bankAccountTransactionSchema),
        defaultValues: {
            bankAccountId,
            date: transaction?.date ? new Date(transaction.date) : new Date(),
            description: transaction?.description || "",
            amount: transaction?.amount ? String(transaction.amount) : "",
            type: transaction?.type || TransactionType.DEBIT,
            paymentMethod: transaction?.paymentMethod || "PIX",
            category: transaction?.category || "",
            reference: transaction?.reference || "",
            status: transaction?.status || TransactionStatus.PENDING,
        },
    })

    async function onSubmit(values: any) {
        setIsSubmitting(true)
        try {
            // Se o valor da data vier como string do input nativo, convertemos para Date
            const submittedValues = {
                ...values,
                date: typeof values.date === 'string' ? new Date(values.date) : values.date
            }

            const result = transaction?.id 
                ? await updateTransaction(transaction.id, submittedValues)
                : await createTransaction(submittedValues)

            if (result.success) {
                toast.success(transaction?.id ? t("updateSuccess") : t("createSuccess"))
                onSuccess?.()
            } else {
                toast.error(result.error || commonT("error"))
            }
        } catch (error) {
            toast.error(commonT("error"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("date")}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field} 
                                        value={field.value instanceof Date 
                                            ? field.value.toISOString().split('T')[0] 
                                            : field.value || ""
                                        }
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("type")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={TransactionType.CREDIT}>{t("credit")}</SelectItem>
                                        <SelectItem value={TransactionType.DEBIT}>{t("debit")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("description")}</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Aluguel, Venda de Produto..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("amount")}</FormLabel>
                                <FormControl>
                                    <MoneyInput
                                        placeholder="R$ 0,00"
                                        value={field.value}
                                        onValueChange={(value: any) => field.onChange(value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("category")}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Operacional" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("reference")}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nº Documento, NF..." {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("paymentMethod")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Forma de pagamento" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PIX">{t("paymentMethods.PIX")}</SelectItem>
                                        <SelectItem value="TED">{t("paymentMethods.TED")}</SelectItem>
                                        <SelectItem value="DOC">{t("paymentMethods.DOC")}</SelectItem>
                                        <SelectItem value="BOLETO">{t("paymentMethods.BOLETO")}</SelectItem>
                                        <SelectItem value="CREDIT_CARD">{t("paymentMethods.CREDIT_CARD")}</SelectItem>
                                        <SelectItem value="DEBIT_CARD">{t("paymentMethods.DEBIT_CARD")}</SelectItem>
                                        <SelectItem value="CASH">{t("paymentMethods.CASH")}</SelectItem>
                                        <SelectItem value="OTHER">{t("paymentMethods.OTHER")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">{t("status")}</FormLabel>
                                <div className="text-xs text-muted-foreground italic">
                                    {field.value === TransactionStatus.RECONCILED ? t("reconciled") : t("pending")}
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value === TransactionStatus.RECONCILED}
                                    onCheckedChange={(checked) => 
                                        field.onChange(checked ? TransactionStatus.RECONCILED : TransactionStatus.PENDING)
                                    }
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        {commonT("cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {commonT("save")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
