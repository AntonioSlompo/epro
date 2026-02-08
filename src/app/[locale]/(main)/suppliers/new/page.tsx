
import { PageHeader } from "@/components/ui/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

import { getTranslations } from "next-intl/server"

export default async function NewSupplierPage() {
    const t = await getTranslations("Suppliers")

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("createTitle")}
                description={t("createDesc")}
                backHref="/suppliers"
            />
            <SupplierForm mode="create" />
        </div>
    )
}
