import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { getTechnicians } from "@/actions/technician-actions"
import { TechniciansTable } from "./technicians-table"

import { getTranslations } from "next-intl/server"

import { SearchInput } from "@/components/ui/search-input"
import { DataViewToggle } from "@/components/ui/data-view-toggle"

export default async function TechniciansPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const search = typeof searchParams.search === 'string' ? searchParams.search : ''
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list'
    const { technicians, totalPages } = await getTechnicians({ page, limit: 12, search })
    const t = await getTranslations("Technicians")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild className="gap-2">
                    <Link href="/technicians/new">
                        <Plus className="h-4 w-4" />
                        {t("addTechnician")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <TechniciansTable data={technicians} totalPages={totalPages} page={page} viewMode={view as any} />
            </div>
        </div>
    )
}
