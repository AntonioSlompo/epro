import { PageHeader } from "@/components/ui/page-header"
import { BankForm } from "@/components/banks/bank-form"
import { getBank } from "@/actions/bank-actions"
import { getTranslations } from "next-intl/server"
import { redirect } from "@/i18n/routing"

export default async function EditBankPage(props: {
    params: Promise<{ id: string, locale: string }>
}) {
    const params = await props.params
    const { bank } = await getBank(params.id)
    const t = await getTranslations("Banks")

    if (!bank) {
        redirect({ href: "/banks", locale: params.locale });
        return null;
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/banks"
            />

            <BankForm initialData={bank} isEditing />
        </div>
    )
}
