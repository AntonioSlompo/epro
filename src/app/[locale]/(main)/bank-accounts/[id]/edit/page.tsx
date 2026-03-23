import { PageHeader } from "@/components/ui/page-header"
import { BankAccountForm } from "@/components/bank-accounts/bank-account-form"
import { getTranslations } from "next-intl/server"
import { getBanks } from "@/actions/bank-actions"
import { getBankAccount } from "@/actions/bank-account-actions"
import { notFound } from "next/navigation"

export default async function EditBankAccountPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const t = await getTranslations("BankAccounts")
    
    const [ { bankAccount }, { banks } ] = await Promise.all([
        getBankAccount(params.id),
        getBanks({ limit: 1000 })
    ])

    if (!bankAccount) {
        notFound()
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/bank-accounts"
            />

            <BankAccountForm 
                initialData={bankAccount} 
                banks={banks || []} 
                isEditing 
            />
        </div>
    )
}
