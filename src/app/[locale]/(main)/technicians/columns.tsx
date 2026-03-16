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
import { deleteTechnician } from "@/actions/technician-actions"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useTransition } from "react"

export const useTechnicianColumns = () => {
    const t = useTranslations("Technicians")
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
                const tech = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                            <span className="text-xs text-muted-foreground uppercase">{tech.name.substring(0, 2)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]" title={tech.name}>{tech.name}</span>
                            {tech.user && (
                                <span className="text-xs text-muted-foreground">Usuário: {tech.user.name || tech.user.email}</span>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "department",
            header: t("department"),
            cell: ({ row }) => row.original.department || "-"
        },
        {
            accessorKey: "specialties",
            header: t("specialties"),
            cell: ({ row }) => {
                 const spec = row.original.specialties;
                 if (!spec) return "-";
                 return (
                     <div className="truncate max-w-[200px]" title={spec}>
                         {spec}
                     </div>
                 )
            }
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => row.original.email || "-"
        },
        {
            accessorKey: "mobile",
            header: "Celular",
            cell: ({ row }) => row.original.mobile || "-"
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
                const tech = row.original
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const [isPending, startTransition] = useTransition()

                const handleDelete = async () => {
                    if (confirm(t("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                        startTransition(async () => {
                             const result = await deleteTechnician(tech.id);
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
                                <Link href={`/technicians/${tech.id}/edit`} className="flex items-center cursor-pointer">
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
