import { PageHeader } from "@/components/ui/page-header"
import { getUserById } from "@/actions/user-actions"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { UserCompaniesClient } from "@/components/users/user-companies-client"

interface UserCompaniesPageProps {
    params: Promise<{ id: string }>
}

export default async function UserCompaniesPage({ params }: UserCompaniesPageProps) {
    const { id } = await params
    const user = await getUserById(id)
    const t = await getTranslations("Users")

    if (!user) {
        notFound()
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("companies.title")}
                description={`${t("companies.description")} - ${user.name}`}
                backHref="/users"
            />
            <UserCompaniesClient 
                userId={user.id} 
                initialCompanies={user.companies || []}
            />
        </div>
    )
}
