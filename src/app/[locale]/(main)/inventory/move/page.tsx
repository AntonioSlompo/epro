import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { InventoryMoveForm } from "@/components/inventory/inventory-move-form";
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/actions/auth-actions";
import { notFound } from "next/navigation";

export default async function NewInventoryMovePage() {
    const t = await getTranslations("Inventory");
    const tenantId = await getTenant();

    if (!tenantId) notFound();

    const [products, locations] = await Promise.all([
        prisma.product.findMany({
            where: { companyId: tenantId, status: 'ACTIVE' },
            select: { id: true, name: true, sku: true },
            orderBy: { name: 'asc' }
        }),
        prisma.storageLocation.findMany({
            where: { companyId: tenantId, status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ]);

    const formattedProducts = products.map(p => ({
        label: `${p.name} (${p.sku})`,
        value: p.id
    }));

    const formattedLocations = locations.map(l => ({
        label: l.name,
        value: l.id
    }));

    return (
        <div className="flex flex-col w-full h-full gap-8 max-w-5xl">
            <PageHeader
                title={t("titleMove")}
                description={t("descriptionMove")}
                backHref="/inventory"
            />

            <div className="flex-1">
                <InventoryMoveForm 
                    products={formattedProducts} 
                    locations={formattedLocations} 
                />
            </div>
        </div>
    );
}
