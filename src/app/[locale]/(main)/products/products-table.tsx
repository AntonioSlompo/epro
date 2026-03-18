"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Product } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Copy, Package, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
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

    const renderProductCard = (product: Product) => {
        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            {product.image1Url ? (
                                <img src={product.image1Url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={product.name}>{product.name}</h3>
                            {product.sku && (
                                <p className="text-sm text-muted-foreground truncate">
                                    SKU: {product.sku}
                                </p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(product.id); toast.success(tProd("idCopied")); }}>
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

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                            {product.category && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Cat.:</span>
                                    <span className="truncate">{categoryLabels[product.category] || product.category}</span>
                                </div>
                            )}
                            {product.suggestedSellingPrice && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Preço:</span>
                                    <span className="font-medium text-foreground">
                                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.suggestedSellingPrice))}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                            <Badge variant={variantMap[product.status] || "outline"} className="font-normal text-xs">
                                {statusLabels[product.status] || product.status}
                            </Badge>
                            <Badge variant="secondary" className="font-normal text-xs">
                                {typeLabels[product.type] || product.type}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
