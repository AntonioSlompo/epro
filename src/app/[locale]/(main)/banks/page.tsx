import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { getBanks } from "@/actions/bank-actions"
import { BanksTable } from "./banks-table"
import { getTranslations } from "next-intl/server"
import { SearchInput } from "@/components/ui/search-input"
import { DataViewToggle } from "@/components/ui/data-view-toggle"

export default async function BanksPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const search = typeof searchParams.search === 'string' ? searchParams.search : ''
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list'
    const { banks, totalPages } = await getBanks({ page, limit: 12, search })
    const t = await getTranslations("Banks")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild className="gap-2">
                    <Link href="/banks/new">
                        <Plus className="h-4 w-4" />
                        {t("addBank")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <BanksTable data={banks || []} totalPages={totalPages || 0} page={page} viewMode={view as any} />
            </div>
        </div>
    )
}
