import { getBankAccount } from "@/actions/bank-account-actions"
import { getAccountBalance } from "@/actions/bank-account-transaction-actions"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionList } from "@/components/bank-accounts/transactions/transaction-list"
import { getTranslations } from "next-intl/server"
import { Landmark, ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"

export default async function BankAccountDetailsPage(props: {
    params: Promise<{ locale: string; id: string }>
}) {
    const params = await props.params;
    const { bankAccount } = await getBankAccount(params.id)
    
    if (!bankAccount) {
        notFound()
    }

    const { balance } = await getAccountBalance(params.id)
    const t = await getTranslations("BankAccounts")
    const transT = await getTranslations("BankTransactions")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        {bankAccount.bank.logo && (
                            <img 
                                src={bankAccount.bank.logo} 
                                alt={bankAccount.bank.name} 
                                className="h-10 w-10 object-contain rounded-md bg-white p-1 border border-border"
                            />
                        )}
                        <span>{bankAccount.bank.name}</span>
                    </div>
                }
                description={`${bankAccount.type} - Ag: ${bankAccount.agency} - CC: ${bankAccount.number}`}
            >
                <Button variant="outline" size="sm" asChild className="gap-2">
                    <Link href="/bank-accounts">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                </Button>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Saldo Atual */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {transT("balance")}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            balance >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Limite */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("form.limit")}
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(bankAccount.limit || 0))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Total Disponível */}
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {transT("totalAvailable")}
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            (balance + Number(bankAccount.limit || 0)) >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance + Number(bankAccount.limit || 0))}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Dados da Conta */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Agência / Conta
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {bankAccount.agency} / {bankAccount.number}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1">
                <TransactionList bankAccountId={params.id} />
            </div>
        </div>
    )
}
