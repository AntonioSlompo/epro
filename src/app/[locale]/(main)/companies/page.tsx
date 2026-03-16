import { getCompanies } from "@/actions/company-actions"
import { CompaniesTable } from "./companies-table"
import { getTranslations } from "next-intl/server"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { DataViewToggle } from "@/components/ui/data-view-toggle"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, query?: string, view?: string }>
}) {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
        redirect("/pt/dashboard");
    }

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const query = params.query || "";
    const view = params.view || "list";

    const { data, totalPages } = await getCompanies(page, 10, query);
    const t = await getTranslations("Companies");

    return (
        <div className="flex flex-col w-full h-full gap-6">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild>
                    <Link href="/companies/new">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("newCompany")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <CompaniesTable data={data} totalPages={totalPages} page={page} viewMode={view as any} />
            </div>
        </div>
    )
}
