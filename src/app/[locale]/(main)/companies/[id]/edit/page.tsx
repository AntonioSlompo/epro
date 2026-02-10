import { CompanyForm } from "@/components/companies/company-form"
import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { getCompany } from "@/actions/company-actions"
import { notFound } from "next/navigation"

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const company = await getCompany(id);
    const t = await getTranslations("Companies.edit")

    if (!company) {
        notFound();
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
                backHref="/companies"
            />
            {/* Cast company to any to bypass strict type check for now, ensuring compatible shape in schema */}
            <CompanyForm mode="edit" initialData={company as any} />
        </div>
    )
}
