"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Product } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Copy, Package, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/product-actions";

interface ProductsTableProps {
    data: Product[];
    totalPages: number;
    page: number;
    viewMode?: 'list' | 'card';
}

export function ProductsTable({ data, totalPages, page, viewMode }: ProductsTableProps) {
    const t = useTranslations("Common");
    const tProd = useTranslations("Products");

    const renderProductCard = (product: Product) => {
        const typeLabels: Record<string, string> = {
            PHYSICAL: "Físico",
            SERVICE_ONETIME: "Serviço Avulso",
            SERVICE_RECURRING: "Serviço Recorrente",
        };
        const statusLabels: Record<string, string> = {
            ACTIVE: "Ativo",
            INACTIVE: "Inativo",
            DISCONTINUED: "Descontinuado",
        };
        const categoryLabels: Record<string, string> = {
            MONITORING: "Monitoramento",
            MAINTENANCE: "Manutenção",
            INSTALLATION: "Instalação",
            SOFTWARE_LICENSE: "Licença de Software",
            EQUIPMENT: "Equipamento",
        };

        const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            ACTIVE: "default",
            INACTIVE: "secondary",
            DISCONTINUED: "destructive",
        };

        return (
            <div className="flex flex-col h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                        {product.image1Url ? (
                            <img src={product.image1Url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    
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
                                <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
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
                                <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                </div>
                
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{categoryLabels[product.category] || product.category}</Badge>
                        <Badge variant={variantMap[product.status] || "outline"} className="text-[10px] px-1.5 py-0 h-4">{statusLabels[product.status] || product.status}</Badge>
                    </div>
                    
                    <h3 className="font-semibold text-base mt-2 line-clamp-2" title={product.name}>{product.name}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={product.sku}>SKU: {product.sku}</p>
                    
                    {product.suggestedSellingPrice && (
                        <p className="text-sm font-medium mt-1">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.suggestedSellingPrice))}
                        </p>
                    )}
                    
                    <div className="mt-auto pt-3">
                        <Badge variant="secondary" className="w-fit">{typeLabels[product.type] || product.type}</Badge>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            totalPages={totalPages}
            page={page}
            viewMode={viewMode}
            renderCard={renderProductCard}
        />
    );
}
