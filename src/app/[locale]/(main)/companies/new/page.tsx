import { CompanyForm } from "@/components/companies/company-form"
import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"

export default async function NewCompanyPage() {
    const t = await getTranslations("Companies.new")

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
                backHref="/companies"
            />
            <CompanyForm mode="create" />
        </div>
    )
}
