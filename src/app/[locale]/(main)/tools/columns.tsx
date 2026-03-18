"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { deleteTool } from "@/actions/tool-actions"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useTransition } from "react"

export const useToolColumns = () => {
    const t = useTranslations("Tools")
    const tCommon = useTranslations("Common")

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t("name")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const tool = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]" title={tool.name}>{tool.name}</span>
                            {tool.brand && (
                                <span className="text-xs text-muted-foreground">{tool.brand} {tool.model}</span>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "serialNumber",
            header: t("serialNumber"),
            cell: ({ row }) => row.original.serialNumber || "-"
        },
        {
            accessorKey: "category",
            header: t("category"),
            cell: ({ row }) => row.original.category || "-"
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => {
                const status = row.original.status;
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                let statusLabel = status;
                
                switch(status) {
                    case "AVAILABLE": 
                        variant = "default"; 
                        statusLabel = t("form.statusAvailable");
                        break;
                    case "IN_USE": 
                        variant = "secondary"; 
                        statusLabel = t("form.statusInUse");
                        break;
                    case "MAINTENANCE": 
                        variant = "outline"; 
                        statusLabel = t("form.statusMaintenance");
                        break;
                    case "LOST": 
                        variant = "destructive"; 
                        statusLabel = t("form.statusLost");
                        break;
                    case "DAMAGED": 
                        variant = "destructive"; 
                        statusLabel = t("form.statusDamaged");
                        break;
                }

                return (
                    <Badge variant={variant}>
                        {statusLabel}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? tCommon("status.active") : tCommon("status.inactive")}</Badge>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const tool = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [isPending, startTransition] = useTransition()

                const handleDelete = async () => {
                    if (confirm(t("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                        startTransition(async () => {
                             const result = await deleteTool(tool.id);
                             if (result.success) {
                                  toast.success(t("deleteSuccess") || "Excluído com sucesso!");
                             } else {
                                  toast.error(result.error || "Erro ao excluir");
                             }
                        });
                    }
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/tools/${tool.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {tCommon("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" /> {tCommon("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return columns;
}
