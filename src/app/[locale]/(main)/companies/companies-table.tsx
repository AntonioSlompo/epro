"use client"

import { DataTable } from "@/components/ui/data-table"
import { Company } from "@prisma/client"
import { useCompanyColumns } from "./columns"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, Building2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
            <div className="flex flex-col h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                        {company.logoUrl || (company as any).logoBase64 ? (
                            <img src={company.logoUrl || (company as any).logoBase64} alt={company.tradeName || company.name || "Company"} className="h-full w-full object-cover" />
                        ) : (
                            <Building2 className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
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
                
                <div className="flex flex-col flex-1 gap-1">
                    <h3 className="font-semibold text-lg truncate" title={company.tradeName || company.name}>{company.tradeName || company.name}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-1" title={company.email || ""}>{company.email || "Sem e-mail"}</p>
                    <p className="text-xs text-muted-foreground truncate mb-3" title={company.cnpj || ""}>CNPJ: {company.cnpj || "Não informado"}</p>
                    
                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <Badge variant={company.active ? "default" : "secondary"}>
                            {company.active ? tCommon("status.active") : tCommon("status.inactive")}
                        </Badge>
                    </div>
                </div>
            </div>
        )
    }

    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} renderCard={renderCompanyCard} viewMode={viewMode} />
}
