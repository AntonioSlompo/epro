"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export const balanceColumns: ColumnDef<any>[] = [
    {
        accessorKey: "product.name",
        header: "Produto",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.product.name}</span>
                <span className="text-xs text-muted-foreground">SKU: {row.original.product.sku}</span>
            </div>
        )
    },
    {
        accessorKey: "storageLocation.name",
        header: "Local",
    },
    {
        accessorKey: "quantity",
        header: "Quantidade",
        cell: ({ row }) => {
            const qty = Number(row.original.quantity);
            const min = row.original.minQuantity ? Number(row.original.minQuantity) : null;
            
            return (
                <div className="flex items-center gap-2">
                    <span className={min && qty <= min ? "text-destructive font-bold" : ""}>
                        {qty}
                    </span>
                    {min && qty <= min && (
                        <Badge variant="destructive" className="text-[10px] px-1 h-4">Baixo</Badge>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Última Atualização",
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString()
    }
];

const TypeBadge = ({ type }: { type: string }) => {
    // We can't use useTranslations here because it's not a direct column def and may be called outside of a component context if not careful.
    // However, cell renderers are inside a component (DataTable -> flexRender).
    const t = useTranslations("Inventory.types");
    const labels: Record<string, string> = {
        PURCHASE: t("PURCHASE"),
        SALE: t("SALE"),
        TRANSFER: t("TRANSFER"),
        ADJUSTMENT: t("ADJUSTMENT"),
        RETURN: t("RETURN"),
        CONSUMPTION: t("CONSUMPTION"),
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
};

export const transactionColumns: ColumnDef<any>[] = [
    {
        accessorKey: "date",
        header: "Data",
        cell: ({ row }) => new Date(row.original.date).toLocaleString()
    },
    {
        accessorKey: "product.name",
        header: "Produto",
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => <TypeBadge type={row.original.type} />
    },
    {
        accessorKey: "direction",
        header: "Sentido",
        cell: ({ row }) => {
            const dir = row.original.direction;
            return (
                <Badge variant={dir === 'IN' ? 'default' : 'secondary'}>
                    {dir === 'IN' ? 'Entrada' : 'Saída'}
                </Badge>
            );
        }
    },
    {
        accessorKey: "quantity",
        header: "Qtd",
    },
    {
        header: "Local(is)",
        cell: ({ row }) => {
            const src = row.original.sourceLocation?.name;
            const dst = row.original.destinationLocation?.name;
            if (src && dst) return `${src} ➔ ${dst}`;
            return src || dst || "-";
        }
    },
    {
        accessorKey: "document",
        header: "Documento",
    }
];
