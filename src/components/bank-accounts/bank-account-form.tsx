"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bankAccountSchema, type BankAccountFormValues } from "@/schemas/bank-account-schema"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition } from "react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { createBankAccount, updateBankAccount } from "@/actions/bank-account-actions"
import { Landmark, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// @ts-ignore
import { MoneyInput } from "@/components/ui/money-input"

interface BankAccountFormProps {
  initialData?: any
  banks: { id: string, name: string, code: string }[]
  isEditing?: boolean
}

export function BankAccountForm({ initialData, banks, isEditing = false }: BankAccountFormProps) {
  const t = useTranslations("BankAccounts")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema) as any,
    defaultValues: {
      bankId: initialData?.bankId || "",
      agency: initialData?.agency || "",
      type: initialData?.type || "Corrente",
      number: initialData?.number || "",
      limit: initialData?.limit ? String(initialData.limit) : "0",
      openingDate: initialData?.openingDate ? new Date(initialData.openingDate) : null,
      closingDate: initialData?.closingDate ? new Date(initialData.closingDate) : null,
      active: initialData?.active ?? true,
    } as any,
  })

  async function onSubmit(data: BankAccountFormValues) {
    startTransition(async () => {
      const result = isEditing 
        ? await updateBankAccount(initialData.id, data)
        : await createBankAccount(data)

      if (result.success) {
        toast.success(isEditing ? t("form.updateSuccess") : t("form.createSuccess"))
        router.push("/bank-accounts")
        router.refresh()
      } else {
        toast.error(result.error || tCommon("error"))
      }
    })
  }

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. Identificação */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              {t("form.identification")}
            </CardTitle>
            <FormField
              control={form.control as any}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                    {t("form.active")}
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="bankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.bank")} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectBank")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.code} - {bank.name}
                        </SelectItem>
                      ))}
                      {banks.length === 0 && (
                        <SelectItem value="_no_banks" disabled>Nenhum banco cadastrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.type")} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Corrente">Corrente</SelectItem>
                      <SelectItem value="Poupança">Poupança</SelectItem>
                      <SelectItem value="Pagamento">Pagamento</SelectItem>
                      <SelectItem value="Investimento">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="agency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.agency")} *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 0001-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.number")} *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 123456-7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.limit")}</FormLabel>
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
          </CardContent>
        </Card>

        {/* 2. Datas */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t("form.dates")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="openingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.openingDate")}</FormLabel>
                  <FormControl>
                    <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="closingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.closingDate")}</FormLabel>
                  <FormControl>
                    <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
