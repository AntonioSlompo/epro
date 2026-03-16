"use client"

import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { useTechnicianColumns } from "./columns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Pencil, Trash2, Mail, Phone, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { deleteTechnician } from "@/actions/technician-actions"
import { toast } from "sonner"
import { useTransition } from "react"

interface TechniciansTableProps {
    data: any[]
    totalPages: number
    page: number
    viewMode?: 'list' | 'card'
}

export function TechniciansTable({ data, totalPages, page, viewMode = 'list' }: TechniciansTableProps) {
    const t = useTranslations("Common")
    const tTech = useTranslations("Technicians")
    const columns = useTechnicianColumns()
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string) => {
        if (confirm(tTech("deleteConfirm") || "Tem certeza que deseja excluir?")) {
            startTransition(async () => {
                const result = await deleteTechnician(id);
                if (result.success) {
                    toast.success(tTech("deleteSuccess") || "Excluído com sucesso!");
                } else {
                    toast.error(result.error || "Erro ao excluir");
                }
            });
        }
    }

    if (viewMode === 'list') {
        return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} />
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.map((tech) => (
                    <Card key={tech.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                        <CardContent className="p-0 flex flex-col h-full">
                            <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-background border flex justify-center items-center shrink-0">
                                    <span className="text-lg font-semibold text-muted-foreground uppercase">{tech.name.substring(0, 2)}</span>
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-semibold truncate" title={tech.name}>{tech.name}</h3>
                                    {tech.department && (
                                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" />
                                            {tech.department}
                                        </p>
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground" disabled={isPending}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/technicians/${tech.id}/edit`} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(tech.id)} className="text-destructive focus:text-destructive cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    {tech.email && (
                                        <div className="flex items-center text-muted-foreground gap-2 truncate">
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate" title={tech.email}>{tech.email}</span>
                                        </div>
                                    )}
                                    {(tech.mobile || tech.phone) && (
                                        <div className="flex items-center text-muted-foreground gap-2">
                                            <Phone className="h-3.5 w-3.5 shrink-0" />
                                            <span>{tech.mobile || tech.phone}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                                    <Badge variant={tech.active ? "default" : "secondary"} className="font-normal text-xs">
                                        {tech.active ? t("status.active") : t("status.inactive")}
                                    </Badge>
                                    {tech.user && (
                                        <Badge variant="outline" className="font-normal text-xs bg-primary/5 border-primary/20 text-primary">
                                            Vinculado a Usuário
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Pagination for Card View */}
            {totalPages > 1 && (
                <div className="pt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                    </p>
                    <div className="flex space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page <= 1}
                            asChild
                        >
                            <Link href={`/technicians?page=${page - 1}${viewMode ? `&view=${viewMode}` : ''}`}>Anterior</Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page >= totalPages}
                            asChild
                        >
                            <Link href={`/technicians?page=${page + 1}${viewMode ? `&view=${viewMode}` : ''}`}>Próxima</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
