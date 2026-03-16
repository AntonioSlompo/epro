import { getTranslations } from "next-intl/server";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewVehiclePage() {
    const t = await getTranslations("Vehicles");

    return (
        <div className="flex flex-col w-full h-full gap-8 max-w-5xl pb-12">
            <PageHeader
                title={t("titleNew")}
                description={t("descriptionNew")}
                backHref="/vehicles"
            />

            <div className="flex-1 min-h-0">
                <VehicleForm />
            </div>
        </div>
    );
}
