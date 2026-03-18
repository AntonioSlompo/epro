import { PageHeader } from "@/components/ui/page-header"
import { getTranslations } from "next-intl/server"
import { ToolForm } from "@/components/tools/tool-form"
import { getTool } from "@/actions/tool-actions"
import { redirect } from "@/i18n/routing"

export default async function EditToolPage(props: {
    params: Promise<{ id: string, locale: string }>
}) {
    const params = await props.params
    const { id } = params
    const t = await getTranslations("Tools")
    const { success, tool } = await getTool(id)

    if (!success || !tool) {
        redirect({ href: "/tools", locale: params.locale });
        return null;
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8 pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/tools"
            />
            
            <ToolForm initialData={tool} />
        </div>
    )
}
