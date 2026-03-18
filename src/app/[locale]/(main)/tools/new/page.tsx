import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { ToolForm } from "@/components/tools/tool-form"

export default async function NewToolPage() {
    const t = await getTranslations("Tools")

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/tools"
            />
            
            <ToolForm />
        </div>
    )
}
