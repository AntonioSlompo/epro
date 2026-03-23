import { getContract } from "@/actions/contract-actions";
import { getEntities } from "@/actions/entity-actions";
import { getProducts } from "@/actions/product-actions";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { PageHeader } from "@/components/ui/page-header";
import { ContractForm } from "@/components/contracts/contract-form";

export default async function EditContractPage(props: {
    params: Promise<{ id: string, locale: string }>
}) {
    const params = await props.params;
    const { contract } = await getContract(params.id);
    
    if (!contract) {
        redirect({ href: "/contracts", locale: params.locale });
        return null;
    }

    const t = await getTranslations("Contracts");
    const { entities: customers } = await getEntities({ limit: 100 });
    const { products } = await getProducts({ limit: 100 });

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("editTitle")}
                description={`${t("editDesc")} ${contract.contractNumber}`}
                backHref="/contracts"
            />

            <ContractForm 
                initialData={contract} 
                customers={customers.filter((e: any) => e.isCustomer)} 
                products={products}
            />
        </div>
    );
}
