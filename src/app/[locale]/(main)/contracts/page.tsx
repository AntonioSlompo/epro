import { getContracts } from "@/actions/contract-actions";
import { getTranslations } from "next-intl/server";
import { ContractsTable } from "@/app/[locale]/(main)/contracts/contracts-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataViewToggle } from "@/components/ui/data-view-toggle";

export default async function ContractsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list';
    
    const t = await getTranslations("Contracts");
    const { contracts, totalPages } = await getContracts({ page, limit: 10, search });

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild className="gap-2">
                    <Link href="/contracts/new">
                        <Plus className="h-4 w-4" />
                        {t("addContract")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <ContractsTable 
                    data={contracts || []} 
                    totalPages={totalPages || 0} 
                    page={page} 
                    viewMode={view as any} 
                />
            </div>
        </div>
    );
}
