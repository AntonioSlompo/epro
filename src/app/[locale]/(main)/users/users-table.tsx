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
    viewMode?: 'list' | 'card'
}

export function UsersTable({ data, totalPages, page, viewMode }: UsersTableProps) {
    const t = useTranslations("Common")
    const tUsers = useTranslations("Dashboard.nav") // Reuse or create specific Users namespace if needed
    const tRole = useTranslations("Users.roles")
    const tUserForm = useTranslations("Users.form")
    const tUsersRoot = useTranslations("Users")

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
            accessorKey: "role",
            header: tUserForm("roleLabel"),
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                // Safely translate the role or fallback to raw
                return <Badge variant="outline">{role ? tRole(role as any) : ""}</Badge>
            }
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
                            {user.role !== 'SUPER_ADMIN' && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/users/${user.id}/companies`} className="flex items-center cursor-pointer">
                                        <ArrowUpDown className="mr-2 h-4 w-4" /> {tUsersRoot("manageCompanies")}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [t, tRole, tUserForm, tUsersRoot])

    const renderUserCard = (user: User) => {
        const u = user as any;
        const handleDelete = async () => {
            if (confirm(t("confirmDelete"))) {
                await deleteUser(u.id);
            }
        }

        return (
            <div className="overflow-hidden flex flex-col rounded-lg border hover:border-primary/50 transition-colors bg-card">
                {/* Header */}
                <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                        {u.image ? (
                            <img src={u.image} alt={u.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-lg font-semibold text-muted-foreground uppercase">
                                {u.name?.substring(0, 2) || "??"}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-semibold truncate" title={u.name || ""}>{u.name || "Sem Nome"}</h3>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.id)}>
                                {t("copyId")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${u.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                </Link>
                            </DropdownMenuItem>
                            {u.role !== 'SUPER_ADMIN' && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/users/${u.id}/companies`} className="flex items-center cursor-pointer">
                                        <ArrowUpDown className="mr-2 h-4 w-4" /> {tUsersRoot("manageCompanies")}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center text-muted-foreground gap-2">
                            <span className="font-medium text-xs uppercase tracking-wider">Nível:</span>
                            <span>{u.role ? tRole(u.role) : ""}</span>
                        </div>
                    </div>
                    <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                        <Badge variant={u.active ? "default" : "secondary"} className="font-normal text-xs">
                            {u.active ? t("status.active") : t("status.inactive")}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-xs">
                            {u.role ? tRole(u.role) : ""}
                        </Badge>
                    </div>
                </div>
            </div>
        )
    }

    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} renderCard={renderUserCard} viewMode={viewMode} />
}
