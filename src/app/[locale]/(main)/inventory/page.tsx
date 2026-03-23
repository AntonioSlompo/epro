import { getInventoryBalances, getInventoryTransactions } from "@/actions/inventory-actions";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { InventoryTabs } from "./inventory-tabs";
import { SearchInput } from "@/components/ui/search-input";
import { InventoryTabToggle } from "@/components/inventory/inventory-tab-toggle";

export default async function InventoryPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const tab = typeof searchParams.tab === 'string' ? searchParams.tab : 'balances';
    
    const t = await getTranslations("Inventory");

    // Fetch initial data for the selected tab (Server Side)
    let balances: any[] = [];
    let transactions: any[] = [];
    let totalPages = 0;

    if (tab === 'balances') {
        const res = await getInventoryBalances({ page, search });
        balances = res.balances || [];
        totalPages = res.totalPages || 0;
    } else {
        const res = await getInventoryTransactions({ page, search });
        transactions = res.transactions || [];
        totalPages = res.totalPages || 0;
    }

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <InventoryTabToggle 
                    balancesLabel={t("balances")}
                    historyLabel={t("transactions")}
                />
                <Button asChild className="gap-2 shrink-0">
                    <Link href="/inventory/move">
                        <Plus className="h-4 w-4" />
                        {t("newMove")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0 pt-2">
                <InventoryTabs 
                    initialBalances={balances}
                    initialTransactions={transactions}
                    totalPages={totalPages}
                    currentPage={page}
                    currentTab={tab}
                    search={search}
                />
            </div>
        </div>
    );
}
