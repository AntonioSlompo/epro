import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { TechnicianForm } from "@/components/technicians/technician-form"

export default async function NewTechnicianPage() {
    const t = await getTranslations("Technicians")

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/technicians"
            />
            
            <TechnicianForm />
        </div>
    )
}
