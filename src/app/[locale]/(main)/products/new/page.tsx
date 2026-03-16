import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/components/products/product-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewProductPage() {
    const t = await getTranslations("Products");

    return (
        <div className="flex flex-col w-full h-full gap-8 max-w-5xl pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/products"
            />

            <div className="flex-1 min-h-0">
                <ProductForm />
            </div>
        </div>
    );
}
