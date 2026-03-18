"use client"

import { DataTable } from "@/components/ui/data-table"
import { Company } from "@prisma/client"
import { useCompanyColumns } from "./columns"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash, Building2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { deleteCompany } from "@/actions/company-actions"
import { Badge } from "@/components/ui/badge"

interface CompaniesTableProps {
    data: Company[]
    totalPages: number
    page: number
    viewMode?: 'list' | 'card'
}

export function CompaniesTable({ data, totalPages, page, viewMode }: CompaniesTableProps) {
    const columns = useCompanyColumns();
    const tCommon = useTranslations("Common");
    const t = useTranslations("Companies");

    const renderCompanyCard = (company: Company) => {
        const handleDelete = async () => {
            if (confirm(tCommon("confirmDelete"))) {
                await deleteCompany(company.id);
            }
        }

        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            {company.logoUrl || (company as any).logoBase64 ? (
                                <img src={company.logoUrl || (company as any).logoBase64} alt={company.tradeName || company.name || "Company"} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={company.tradeName || company.name}>
                                {company.tradeName || company.name}
                            </h3>
                            {company.name && company.tradeName && (
                                <p className="text-sm text-muted-foreground truncate">{company.name}</p>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{tCommon("actions")}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(company.id)}>
                                    {tCommon("copyId")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/companies/${company.id}/edit`} className="flex items-center cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> {tCommon("edit")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" /> {tCommon("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                            {company.email && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">Email:</span>
                                    <span className="truncate">{company.email}</span>
                                </div>
                            )}
                            {company.cnpj && (
                                <div className="flex items-center text-muted-foreground gap-2">
                                    <span className="font-medium text-xs uppercase tracking-wider">CNPJ:</span>
                                    <span className="truncate">{company.cnpj}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                            <Badge variant={company.active ? "default" : "secondary"} className="font-normal text-xs">
                                {company.active ? tCommon("status.active") : tCommon("status.inactive")}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} renderCard={renderCompanyCard} viewMode={viewMode} />
}
