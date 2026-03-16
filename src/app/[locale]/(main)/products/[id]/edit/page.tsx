import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/components/products/product-form";
import { getProduct } from "@/actions/product-actions";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const t = await getTranslations("Products");
    const { product, success } = await getProduct(params.id);

    if (!success || !product) {
        notFound();
    }

    // Prisma Decimals to Numbers for the form
    const formattedData = {
        ...product,
        subscriptionPrice: product.subscriptionPrice ? Number(product.subscriptionPrice) : null,
        setupFee: product.setupFee ? Number(product.setupFee) : null,
        suggestedSellingPrice: product.suggestedSellingPrice ? Number(product.suggestedSellingPrice) : null,
        averageCost: product.averageCost ? Number(product.averageCost) : null,
        salesCommission: product.salesCommission ? Number(product.salesCommission) : null,
        recurringCommission: product.recurringCommission ? Number(product.recurringCommission) : null,
        bundleDiscount: product.bundleDiscount ? Number(product.bundleDiscount) : null,
    };

    return (
        <div className="flex flex-col w-full h-full gap-8 max-w-5xl pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/products"
            />

            <div className="flex-1 min-h-0">
                <ProductForm initialData={formattedData} />
            </div>
        </div>
    );
}
