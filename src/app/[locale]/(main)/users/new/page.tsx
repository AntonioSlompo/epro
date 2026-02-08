
import { PageHeader } from "@/components/ui/page-header"
import { UserForm } from "@/components/users/user-form"

import { getTranslations } from "next-intl/server"

export default async function NewUserPage() {
    const t = await getTranslations("Users")

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("createTitle")}
                description={t("createDesc")}
                backHref="/users"
            />
            <UserForm mode="create" />
        </div>
    )
}
