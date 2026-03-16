"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Product } from "@prisma/client";
import { deleteProduct } from "@/actions/product-actions";

// Helper component for translation
const ActionCell = ({ row }: { row: any }) => {
    const t = useTranslations("Common");
    const tProd = useTranslations("Products");
    const product = row.original;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("actions")}</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        navigator.clipboard.writeText(product.id);
                        toast.success(tProd("idCopied"));
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("copyId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/products/${product.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={async () => {
                        if (confirm("Tem certeza que deseja excluir este produto?")) {
                            const result = await deleteProduct(product.id);
                            if (result.success) {
                                toast.success("Produto excluído com sucesso!");
                            } else {
                                toast.error(result.error || "Erro ao excluir produto");
                            }
                        }
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "sku",
        header: "SKU",
    },
    {
        accessorKey: "name",
        header: "Nome/Descrição",
    },
    {
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => {
            const category = row.original.category;
            // Provide a friendly name based on enum
            const categoryLabels: Record<string, string> = {
                MONITORING: "Monitoramento",
                MAINTENANCE: "Manutenção",
                INSTALLATION: "Instalação",
                SOFTWARE_LICENSE: "Licença de Software",
                EQUIPMENT: "Equipamento",
            };
            return <Badge variant="outline">{categoryLabels[category as string] || category}</Badge>;
        },
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const type = row.original.type;
            const labels: Record<string, string> = {
                PHYSICAL: "Físico",
                SERVICE_ONETIME: "Serviço Avulso",
                SERVICE_RECURRING: "Serviço Recorrente",
            };
            return <Badge variant="secondary">{labels[type as string] || type}</Badge>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const labels: Record<string, string> = {
                ACTIVE: "Ativo",
                INACTIVE: "Inativo",
                DISCONTINUED: "Descontinuado",
            };
            const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                ACTIVE: "default",
                INACTIVE: "secondary",
                DISCONTINUED: "destructive",
            };
            return (
                <Badge variant={variantMap[status as string] || "outline"}>
                    {labels[status as string] || status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ActionCell,
    },
];
