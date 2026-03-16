import { getEntities } from "@/actions/entity-actions";
import { getTranslations } from "next-intl/server";
import { EntitiesTable } from "./entities-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataViewToggle } from "@/components/ui/data-view-toggle";

export default async function EntitiesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list';
    
    const t = await getTranslations("Entities");
    const { entities, totalPages } = await getEntities({ page, limit: 10, search });

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild className="gap-2">
                    <Link href="/entities/new">
                        <Plus className="h-4 w-4" />
                        {t("addEntity")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <EntitiesTable 
                    data={entities || []} 
                    totalPages={totalPages || 0} 
                    page={page} 
                    viewMode={view as any} 
                />
            </div>
        </div>
    );
}
