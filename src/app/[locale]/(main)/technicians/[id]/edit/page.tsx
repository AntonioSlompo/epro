import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { TechnicianForm } from "@/components/technicians/technician-form"
import { getTechnician } from "@/actions/technician-actions"
import { redirect } from "@/i18n/routing"

export default async function EditTechnicianPage(props: {
    params: Promise<{ id: string, locale: string }>
}) {
    const params = await props.params
    const { id } = params
    const t = await getTranslations("Technicians")
    const { success, technician } = await getTechnician(id)

    if (!success || !technician) {
        redirect({ href: "/technicians", locale: params.locale });
        return null;
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/technicians"
            />
            
            <TechnicianForm initialData={technician} />
        </div>
    )
}
