import { StorageLocationForm } from "../storage-location-form";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewStorageLocationPage() {
    const t = await getTranslations("StorageLocations");

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/storage-locations"
            />
            <div className="flex-1">
                <StorageLocationForm />
            </div>
        </div>
    );
}
