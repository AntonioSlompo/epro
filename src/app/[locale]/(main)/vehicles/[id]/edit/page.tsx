import { getTranslations } from "next-intl/server";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { PageHeader } from "@/components/ui/page-header";
import { getVehicle } from "@/actions/vehicle-actions";
import { redirect } from "@/i18n/routing";

export default async function EditVehiclePage(props: { params: Promise<{ id: string, locale: string }> }) {
    const params = await props.params;
    const t = await getTranslations("Vehicles");
    const { success, vehicle } = await getVehicle(params.id);

    if (!success || !vehicle) {
        redirect({ href: "/vehicles", locale: params.locale });
        return null;
    }

    // Convert decimal to number not needed here unless we use Decimal in prisma, which we didn't (used Int for numbers)

    return (
        <div className="flex flex-col w-full h-full gap-8 max-w-5xl pb-12">
            <PageHeader
                title={t("titleEdit")}
                description={t("descriptionEdit")}
                backHref="/vehicles"
            />

            <div className="flex-1 min-h-0">
                <VehicleForm initialData={vehicle} />
            </div>
        </div>
    );
}
