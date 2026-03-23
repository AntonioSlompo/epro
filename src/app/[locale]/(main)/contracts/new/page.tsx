import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { ContractForm } from "@/components/contracts/contract-form";
import { getEntities } from "@/actions/entity-actions";
import { getProducts } from "@/actions/product-actions";

export default async function NewContractPage() {
    const t = await getTranslations("Contracts");
    
    // Fetch customers and products for selection
    const { entities: customers } = await getEntities({ limit: 100 }); // Simple fetch for now
    const { products } = await getProducts({ limit: 100 });

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("createTitle")}
                description={t("createDesc")}
                backHref="/contracts"
            />

            <ContractForm 
                customers={customers.filter((e: any) => e.isCustomer)} 
                products={products}
            />
        </div>
    );
}
