import { getCompanies } from "@/actions/company-actions"
import { CompaniesTable } from "./companies-table"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const query = params.query || "";

    const { data, totalPages } = await getCompanies(page, 10, query);
    const t = await getTranslations("Companies");

    return (
        <div className="flex flex-col w-full h-full gap-6">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <Button asChild>
                    <Link href="/companies/new">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("newCompany")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <CompaniesTable data={data} totalPages={totalPages} page={page} />
            </div>
        </div>
    )
}
