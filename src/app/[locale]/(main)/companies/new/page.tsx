import { CompanyForm } from "@/components/companies/company-form"
import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

export default async function NewCompanyPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
        redirect("/pt/dashboard");
    }

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
