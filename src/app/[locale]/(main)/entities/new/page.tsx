import { EntityForm } from "@/components/entities/entity-form";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewEntityPage() {
    const t = await getTranslations("Entities");

    return (
        <div className="w-full h-full max-w-5xl space-y-8">
            <PageHeader
                title={t("createTitle")}
                description={t("createDesc")}
                backHref="/entities"
            />

            <EntityForm />
        </div>
    );
}
