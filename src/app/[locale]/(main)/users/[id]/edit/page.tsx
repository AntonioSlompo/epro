
import { PageHeader } from "@/components/ui/page-header"
import { UserForm } from "@/components/users/user-form"
import { getUserById } from "@/actions/user-actions"
import { notFound } from "next/navigation"

interface EditUserPageProps {
    params: Promise<{ id: string }>
}

import { getTranslations } from "next-intl/server"

export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params
    const user = await getUserById(id)
    const t = await getTranslations("Users")

    if (!user) {
        notFound()
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("editTitle")}
                description={`${t("editDesc")} ${user.name}`}
                backHref="/users"
            />
            <UserForm mode="edit" initialData={user} />
        </div>
    )
}
