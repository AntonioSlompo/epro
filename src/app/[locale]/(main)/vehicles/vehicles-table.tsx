"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Copy, Trash2, Car } from "lucide-react";
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

    const renderVehicleCard = (vehicle: Vehicle) => {
        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            <Car className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={`${vehicle.brand} ${vehicle.model}`}>
                                {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate font-medium uppercase tracking-wider">
                                {vehicle.plate}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(vehicle.id); toast.success(tVehicles("idCopied")); }}>
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

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center text-muted-foreground gap-2">
                                <span className="font-medium text-xs uppercase tracking-wider">Tipo:</span>
                                <span>{typeLabels[vehicle.type] || vehicle.type}</span>
                            </div>
                            {vehicle.yearManufacture && vehicle.yearModel && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Ano:</span>
                                    <span>{vehicle.yearManufacture}/{vehicle.yearModel}</span>
                                </div>
                            )}
                            {vehicle.color && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Cor:</span>
                                    <span>{vehicle.color}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                            <Badge variant={variantMap[vehicle.status] || "outline"} className="font-normal text-xs">
                                {statusLabels[vehicle.status] || vehicle.status}
                            </Badge>
                            <Badge variant="outline" className="font-normal text-xs">
                                {typeLabels[vehicle.type] || vehicle.type}
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
            renderCard={renderVehicleCard}
        />
    );
}
