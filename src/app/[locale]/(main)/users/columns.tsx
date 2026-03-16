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
import Link from "next/link"
import { deleteUser } from "@/actions/user-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserWithCompanies = User & {
    companies?: { id: string, name: string }[]
};

export const columns: ColumnDef<UserWithCompanies>[] = [
    {
        id: "avatar",
        cell: ({ row }) => {
            const user = row.original;
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
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const tRole = require("next-intl").useTranslations("Users.roles");
            return <Badge variant="outline">{tRole(role)}</Badge>
        }
    },
    {
        accessorKey: "companies",
        header: "Companies",
        cell: ({ row }) => {
            const companies = row.original.companies || [];
            if (companies.length === 0) return <span className="text-muted-foreground text-xs">None</span>;
            
            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {companies.slice(0, 2).map((c: any) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px] px-1.5 py-0">{c.name}</Badge>
                    ))}
                    {companies.length > 2 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{companies.length - 2}</Badge>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("active") as boolean;
            return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

            const handleDelete = async () => {
                if (confirm("Are you sure you want to delete this user?")) {
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                            Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}/edit`} className="flex items-center cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {user.role !== 'SUPER_ADMIN' && (
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}/companies`} className="flex items-center cursor-pointer">
                                    <ArrowUpDown className="mr-2 h-4 w-4" /> {/* Or another icon */} Manage Companies
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
