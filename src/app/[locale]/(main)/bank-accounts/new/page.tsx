import { PageHeader } from "@/components/ui/page-header"
import { BankAccountForm } from "@/components/bank-accounts/bank-account-form"
import { getTranslations } from "next-intl/server"
import { getBanks } from "@/actions/bank-actions"

export default async function NewBankAccountPage() {
    const t = await getTranslations("BankAccounts")
    const { banks } = await getBanks({ limit: 1000 })

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/bank-accounts"
            />

            <BankAccountForm banks={banks || []} />
        </div>
    )
}
