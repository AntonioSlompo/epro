import { getProducts } from "@/actions/product-actions";
import { getTranslations } from "next-intl/server";
import { ProductsTable } from "./products-table";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { DataViewToggle } from "@/components/ui/data-view-toggle";

export default async function ProductsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const view = typeof searchParams.view === 'string' ? searchParams.view : 'list';
    
    const t = await getTranslations("Products");
    const { products, totalPages } = await getProducts({ page, limit: 10, search });

    const formattedProducts = (products || []).map((product: any) => ({
        ...product,
        subscriptionPrice: product.subscriptionPrice ? Number(product.subscriptionPrice) : null,
        setupFee: product.setupFee ? Number(product.setupFee) : null,
        suggestedSellingPrice: product.suggestedSellingPrice ? Number(product.suggestedSellingPrice) : null,
        averageCost: product.averageCost ? Number(product.averageCost) : null,
        salesCommission: product.salesCommission ? Number(product.salesCommission) : null,
        recurringCommission: product.recurringCommission ? Number(product.recurringCommission) : null,
        bundleDiscount: product.bundleDiscount ? Number(product.bundleDiscount) : null,
    })) as any;

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <DataViewToggle />
                <Button asChild className="gap-2">
                    <Link href="/products/new">
                        <Plus className="h-4 w-4" />
                        {t("addProduct")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <ProductsTable 
                    data={formattedProducts} 
                    totalPages={totalPages || 0} 
                    page={page} 
                    viewMode={view as any} 
                />
            </div>
        </div>
    );
}
