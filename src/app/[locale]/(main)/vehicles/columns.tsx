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
import { Vehicle } from "@prisma/client";
import { deleteVehicle } from "@/actions/vehicle-actions";

const ActionCell = ({ row }: { row: any }) => {
    const t = useTranslations("Common");
    const tVehicles = useTranslations("Vehicles");
    const vehicle = row.original;

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
                        navigator.clipboard.writeText(vehicle.id);
                        toast.success(tVehicles("idCopied"));
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("copyId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/vehicles/${vehicle.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={async () => {
                        if (confirm(tVehicles("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                            const result = await deleteVehicle(vehicle.id);
                            if (result.success) {
                                toast.success(tVehicles("deleteSuccess") || "Excluído com sucesso!");
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

export const columns: ColumnDef<Vehicle>[] = [
    {
        accessorKey: "plate",
        header: "Placa",
    },
    {
        accessorKey: "brand",
        header: "Marca/Modelo",
        cell: ({ row }) => `${row.original.brand} ${row.original.model}`,
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
            const typeLabels: Record<string, string> = {
                CAR: "Carro",
                MOTORCYCLE: "Moto",
                TRUCK: "Caminhão",
                VAN: "Van",
                OTHER: "Outro",
            };
            return <Badge variant="outline">{typeLabels[row.original.type] || row.original.type}</Badge>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusLabels: Record<string, string> = {
                AVAILABLE: "Disponível",
                IN_USE: "Em Uso",
                MAINTENANCE: "Manutenção",
                INACTIVE: "Inativo",
            };
            const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                AVAILABLE: "default",
                IN_USE: "secondary",
                MAINTENANCE: "outline",
                INACTIVE: "destructive",
            };
            return (
                <Badge variant={variantMap[row.original.status] || "outline"}>
                    {statusLabels[row.original.status] || row.original.status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ActionCell,
    },
];
