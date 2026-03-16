"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Copy, User, Users, Trash2 } from "lucide-react";
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
import { deleteEntity } from "@/actions/entity-actions";

interface EntitiesTableProps {
    data: any[];
    totalPages: number;
    page: number;
    viewMode?: 'list' | 'card';
}

export function EntitiesTable({ data, totalPages, page, viewMode }: EntitiesTableProps) {
    const t = useTranslations("Common");
    const tEnt = useTranslations("Entities");

    const renderEntityCard = (entity: any) => {
        const isCustomer = entity.isCustomer;
        const isSupplier = entity.isSupplier;
        let typeLabel = "";
        if (isCustomer && isSupplier) typeLabel = "Ambos";
        else if (isCustomer) typeLabel = "Cliente";
        else if (isSupplier) typeLabel = "Fornecedor";
        else typeLabel = "N/D";

        return (
            <div className="flex flex-col h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                        {isCustomer ? <User className="h-6 w-6 text-primary" /> : <Users className="h-6 w-6 text-primary" />}
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
                                    navigator.clipboard.writeText(entity.id);
                                    toast.success(tEnt("idCopied"));
                                }}
                            >
                                <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/entities/${entity.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={async () => {
                                    if (confirm(tEnt("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                                        const result = await deleteEntity(entity.id);
                                        if (result.success) {
                                            toast.success(tEnt("deleteSuccess") || "Excluído com sucesso!");
                                        } else {
                                            toast.error(result.error || t("error"));
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
                    <h3 className="font-semibold text-lg truncate" title={entity.name}>{entity.name}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-1" title={entity.document}>{entity.document}</p>
                    {entity.tradeName && (
                        <p className="text-xs text-muted-foreground truncate mb-2" title={entity.tradeName}>{entity.tradeName}</p>
                    )}
                    
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <Badge variant="outline">{typeLabel}</Badge>
                        <Badge variant={entity.active ? "default" : "secondary"}>
                            {entity.active ? "Ativo" : "Inativo"}
                        </Badge>
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
            renderCard={renderEntityCard}
        />
    );
}
