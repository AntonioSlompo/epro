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
import { deleteEntity } from "@/actions/entity-actions";

export type EntityColumn = {
    id: string;
    name: string;
    document: string;
    isCustomer: boolean;
    isSupplier: boolean;
    active: boolean;
};

// Helper component for translation
const ActionCell = ({ row }: { row: any }) => {
    const t = useTranslations("Common");
    const tEnt = useTranslations("Entities");
    const entity = row.original;

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
                        navigator.clipboard.writeText(entity.id);
                        toast.success(tEnt("idCopied"));
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("copyId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/entities/${entity.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
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
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<EntityColumn>[] = [
    {
        accessorKey: "name",
        header: "Nome / Razão Social",
    },
    {
        accessorKey: "document",
        header: "Documento",
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const isCustomer = row.original.isCustomer;
            const isSupplier = row.original.isSupplier;
            let label = "";
            if (isCustomer && isSupplier) label = "Ambos";
            else if (isCustomer) label = "Cliente";
            else if (isSupplier) label = "Fornecedor";
            else label = "N/D";

            return <Badge variant="outline">{label}</Badge>;
        },
    },
    {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
            const active = row.original.active;
            return (
                <Badge variant={active ? "default" : "secondary"}>
                    {active ? "Ativo" : "Inativo"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ActionCell,
    },
];
