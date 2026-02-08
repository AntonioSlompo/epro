
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { getSuppliers } from "@/actions/supplier-actions"
import { SuppliersTable } from "./suppliers-table"
import { SearchInput } from "@/components/ui/search-input"

export default async function SuppliersPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const search = typeof searchParams.search === 'string' ? searchParams.search : ''
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
    const { suppliers, totalPages } = await getSuppliers({ page, limit: 10, search }) // Basic fetching for now
    const t = await getTranslations("Suppliers")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <Button asChild className="gap-2">
                    <Link href="/suppliers/new">
                        <Plus className="h-4 w-4" />
                        {t("addSupplier")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <SuppliersTable data={suppliers} totalPages={totalPages} page={page} />
            </div>
        </div>
    )
}
