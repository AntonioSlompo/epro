import { EntityForm } from "@/components/entities/entity-form";
import { getEntity } from "@/actions/entity-actions";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditEntityPage(props: { params: Promise<{ id: string, locale: string }> }) {
    const params = await props.params;
    const t = await getTranslations("Entities");
    const { success, entity } = await getEntity(params.id);

    if (!success || !entity) {
        redirect({ href: "/entities", locale: params.locale });
        return null;
    }

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("editTitle")}
                description={`${t("editDesc")} ${entity.name}`}
                backHref="/entities"
            />

            <EntityForm initialData={entity} />
        </div>
    );
}
