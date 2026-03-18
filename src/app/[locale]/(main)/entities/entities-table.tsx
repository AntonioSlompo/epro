"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Copy, User, Users, Building2, Trash2 } from "lucide-react";
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
import { deleteEntity } from "@/actions/entity-actions";
import { formatDocument } from "@/lib/validators";

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

        const IconComp = isCustomer && isSupplier ? Building2 : isCustomer ? User : Users;

        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            <IconComp className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={entity.name}>{entity.name}</h3>
                            {entity.tradeName && (
                                <p className="text-sm text-muted-foreground truncate">{entity.tradeName}</p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(entity.id); toast.success(tEnt("idCopied")); }}>
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

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                            {entity.document && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Doc.:</span>
                                    <span className="truncate">{formatDocument(entity.document)}</span>
                                </div>
                            )}
                            {entity.email && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Email:</span>
                                    <span className="truncate">{entity.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                            <Badge variant={entity.active ? "default" : "secondary"} className="font-normal text-xs">
                                {entity.active ? t("active") : t("inactive")}
                            </Badge>
                            <Badge variant="outline" className="font-normal text-xs">
                                {typeLabel}
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
            renderCard={renderEntityCard}
        />
    );
}
