import { PageHeader } from "@/components/ui/page-header"
import { BankForm } from "@/components/banks/bank-form"
import { getTranslations } from "next-intl/server"

export default async function NewBankPage() {
    const t = await getTranslations("Banks")

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/banks"
            />

            <BankForm />
        </div>
    )
}
