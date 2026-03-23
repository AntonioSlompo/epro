import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { getBankAccounts } from "@/actions/bank-account-actions"
import { BankAccountsTable } from "./bank-accounts-table"
import { getTranslations } from "next-intl/server"
import { SearchInput } from "@/components/ui/search-input"
import { DataViewToggle } from "@/components/ui/data-view-toggle"

export default async function BankAccountsPage(props: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const search = typeof searchParams.search === 'string' ? searchParams.search : ''
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list'
    
    const { bankAccounts, totalPages } = await getBankAccounts({ 
        page, 
        limit: view === 'card' ? 12 : 10, 
        search 
    })
    const t = await getTranslations("BankAccounts")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <div className="flex items-center gap-2">
                    <SearchInput />
                    <DataViewToggle />
                    <Button asChild className="gap-2">
                        <Link href="/bank-accounts/new">
                            <Plus className="h-4 w-4" />
                            {t("addAccount")}
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <BankAccountsTable 
                    data={bankAccounts || []} 
                    totalPages={totalPages || 0} 
                    page={page} 
                    viewMode={view as any} 
                />
            </div>
        </div>
    )
}
