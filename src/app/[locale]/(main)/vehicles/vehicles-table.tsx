"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Copy, Trash2, Car } from "lucide-react";
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
import { deleteVehicle } from "@/actions/vehicle-actions";

interface VehiclesTableProps {
    data: Vehicle[];
    totalPages: number;
    page: number;
    viewMode?: 'list' | 'card';
}

export function VehiclesTable({ data, totalPages, page, viewMode }: VehiclesTableProps) {
    const t = useTranslations("Common");
    const tVehicles = useTranslations("Vehicles");

    const renderVehicleCard = (vehicle: Vehicle) => {
        const typeLabels: Record<string, string> = {
            CAR: "Carro",
            MOTORCYCLE: "Moto",
            TRUCK: "Caminhão",
            VAN: "Van",
            OTHER: "Outro",
        };
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
            <div className="flex flex-col h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary" />
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
                                    navigator.clipboard.writeText(vehicle.id);
                                    toast.success(tVehicles("idCopied"));
                                }}
                            >
                                <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/vehicles/${vehicle.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
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
                                <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                </div>
                
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{typeLabels[vehicle.type] || vehicle.type}</Badge>
                        <Badge variant={variantMap[vehicle.status] || "outline"} className="text-[10px] px-1.5 py-0 h-4">{statusLabels[vehicle.status] || vehicle.status}</Badge>
                    </div>
                    
                    <h3 className="font-semibold text-base mt-2 line-clamp-2" title={`${vehicle.brand} ${vehicle.model}`}>
                        {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mt-1">{vehicle.plate}</p>
                    
                    <div className="mt-auto pt-3 flex gap-2 text-xs text-muted-foreground">
                        {vehicle.yearManufacture && vehicle.yearModel && (
                            <span>{vehicle.yearManufacture}/{vehicle.yearModel}</span>
                        )}
                        {vehicle.color && (
                            <>
                                <span>•</span>
                                <span>{vehicle.color}</span>
                            </>
                        )}
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
            renderCard={renderVehicleCard}
        />
    );
}
