import { getStorageLocation } from "@/actions/storage-location-actions";
import { StorageLocationForm } from "../../storage-location-form";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

export default async function EditStorageLocationPage(props: {
    params: Promise<{ id: string }>
}) {
    const { id } = await props.params;
    const t = await getTranslations("StorageLocations");
    const { storageLocation, success } = await getStorageLocation(id);

    if (!success || !storageLocation) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/storage-locations"
            />
            <div className="flex-1">
                <StorageLocationForm initialData={storageLocation} />
            </div>
        </div>
    );
}
