
import { PageHeader } from "@/components/ui/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"
import { getSupplierById } from "@/actions/supplier-actions"
import { notFound } from "next/navigation"

interface EditSupplierPageProps {
    params: Promise<{ id: string }>
}

import { getTranslations } from "next-intl/server"

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
    const { id } = await params
    const supplier = await getSupplierById(id)
    const t = await getTranslations("Suppliers")

    if (!supplier) {
        notFound()
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("editTitle")}
                description={`${t("editDesc")} ${supplier.name}`}
                backHref="/suppliers"
            />
            <SupplierForm mode="edit" initialData={supplier} />
        </div>
    )
}
