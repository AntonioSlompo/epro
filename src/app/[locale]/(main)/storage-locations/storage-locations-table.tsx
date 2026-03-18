"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { StorageLocation, Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Copy, Trash2, MapPin, Truck, Box } from "lucide-react";
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
import { deleteStorageLocation } from "@/actions/storage-location-actions";

type StorageLocationWithVehicle = StorageLocation & {
    vehicle: Vehicle | null;
};

interface StorageLocationsTableProps {
    data: StorageLocationWithVehicle[];
    totalPages: number;
    page: number;
    viewMode?: 'list' | 'card';
}

export function StorageLocationsTable({ data, totalPages, page, viewMode }: StorageLocationsTableProps) {
    const t = useTranslations("Common");
    const tLoc = useTranslations("StorageLocations");

    const typeLabels: Record<string, string> = {
        FIXED: tLoc("form.fixed"),
        MOBILE: tLoc("form.mobile"),
        VIRTUAL: tLoc("form.virtual"),
    };

    const typeIcons: Record<string, any> = {
        FIXED: MapPin,
        MOBILE: Truck,
        VIRTUAL: Box,
    };

    const statusLabels: Record<string, string> = {
        ACTIVE: tLoc("form.active"),
        INACTIVE: tLoc("form.inactive"),
        BLOCKED_MOVEMENT: tLoc("form.blocked"),
    };

    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        ACTIVE: "default",
        INACTIVE: "destructive",
        BLOCKED_MOVEMENT: "outline",
    };

    const columns: ColumnDef<StorageLocationWithVehicle>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {(() => {
                        const Icon = typeIcons[row.original.type] || Box;
                        return <Icon className="h-4 w-4 text-muted-foreground" />;
                    })()}
                    {typeLabels[row.original.type]}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={variantMap[row.original.status] || "outline"}>
                    {statusLabels[row.original.status]}
                </Badge>
            ),
        },
        {
            id: "details",
            header: "Detalhes",
            cell: ({ row }) => {
                const loc = row.original;
                if (loc.type === "FIXED" && loc.city) {
                    return <span className="text-sm text-muted-foreground">{loc.city} - {loc.state}</span>;
                }
                if (loc.type === "MOBILE" && loc.vehicle) {
                    return <span className="text-sm text-muted-foreground">{loc.vehicle.plate} ({loc.vehicle.brand} {loc.vehicle.model})</span>;
                }
                return "-";
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const loc = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(loc.id); toast.success(tLoc("idCopied")); }}>
                                <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/storage-locations/${loc.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={async () => {
                                    if (confirm(tLoc("deleteConfirm"))) {
                                        const result = await deleteStorageLocation(loc.id);
                                        if (result.success) {
                                            toast.success(tLoc("deleteSuccess"));
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
                );
            },
        },
    ];

    const renderCard = (loc: StorageLocationWithVehicle) => {
        const Icon = typeIcons[loc.type] || Box;
        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={loc.name}>
                                {loc.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate uppercase tracking-wider">
                                {typeLabels[loc.type]}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(loc.id); toast.success(tLoc("idCopied")); }}>
                                    <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/storage-locations/${loc.id}/edit`} className="flex items-center cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={async () => {
                                        if (confirm(tLoc("deleteConfirm"))) {
                                            const result = await deleteStorageLocation(loc.id);
                                            if (result.success) {
                                                toast.success(tLoc("deleteSuccess"));
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

                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                            {loc.type === "FIXED" && loc.city && (
                                <p className="text-muted-foreground">{loc.street}, {loc.number} - {loc.neighborhood}, {loc.city}/{loc.state}</p>
                            )}
                            {loc.type === "MOBILE" && loc.vehicle && (
                                <div className="flex flex-col">
                                    <p className="font-medium">{loc.vehicle.plate}</p>
                                    <p className="text-muted-foreground">{loc.vehicle.brand} {loc.vehicle.model}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex justify-between items-center">
                            <Badge variant={variantMap[loc.status] || "outline"}>
                                {statusLabels[loc.status]}
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
            renderCard={renderCard}
        />
    );
}
