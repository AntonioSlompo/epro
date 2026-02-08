"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@prisma/client"
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
import { deleteUser } from "@/actions/user-actions"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

interface UsersTableProps {
    data: User[]
    totalPages: number
    page: number
}

export function UsersTable({ data, totalPages, page }: UsersTableProps) {
    const t = useTranslations("Common")
    const tUsers = useTranslations("Dashboard.nav") // Reuse or create specific Users namespace if needed

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: "avatar",
            cell: ({ row }) => {
                const user = row.original as any;
                return (
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
                        {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground font-medium">
                                {user.name?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>
                )
            }
        },
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
        },
        {
            accessorKey: "email",
            header: t("email"),
        },
        {
            accessorKey: "active",
            header: t("status.active"), // Just checking "Status" header, maybe add generic header key? Keeping simple for now
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? t("status.active") : t("status.inactive")}</Badge>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

                const handleDelete = async () => {
                    if (confirm(t("confirmDelete"))) {
                        await deleteUser(user.id);
                    }
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.id)}
                            >
                                {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [t])

    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} />
}
