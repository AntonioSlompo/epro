import { PageHeader } from "@/components/ui/page-header"
import { getOwner } from "@/actions/owner-actions"
import { OwnerForm } from "@/components/owner/owner-form"
import { ShieldAlert } from "lucide-react"

export default async function OwnerPage() {
    const { success, data, error } = await getOwner()

    if (!success && error === "Acesso Negado.") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold">Acesso Restrito</h1>
                <p className="text-muted-foreground">Apenas o administrador do sistema tem permissão para visualizar e editar os dados do proprietário.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full max-w-5xl gap-8 pb-10">
            <PageHeader
                title="Proprietário do Sistema"
                description="Dados legais, de contato e cobrança da empresa licenciadora do software."
            />
            <div className="flex-1">
                <OwnerForm initialData={data} />
            </div>
        </div>
    )
}
