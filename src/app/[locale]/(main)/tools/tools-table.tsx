"use client"

import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { useToolColumns } from "./columns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Pencil, Trash2, Hammer, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { deleteTool } from "@/actions/tool-actions"
import { toast } from "sonner"
import { useTransition } from "react"

interface ToolsTableProps {
    data: any[]
    totalPages: number
    page: number
    viewMode?: 'list' | 'card'
}

export function ToolsTable({ data, totalPages, page, viewMode = 'list' }: ToolsTableProps) {
    const t = useTranslations("Common")
    const tTool = useTranslations("Tools")
    const columns = useToolColumns()
    const [isPending, startTransition] = useTransition()

    const handleDelete = async (id: string) => {
        if (confirm(tTool("deleteConfirm") || "Tem certeza que deseja excluir?")) {
            startTransition(async () => {
                const result = await deleteTool(id);
                if (result.success) {
                    toast.success(tTool("deleteSuccess") || "Excluído com sucesso!");
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
                {data.map((tool) => (
                    <Card key={tool.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                        <CardContent className="p-0 flex flex-col h-full">
                            <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                                    <Hammer className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-semibold truncate" title={tool.name}>{tool.name}</h3>
                                    {tool.category && (
                                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            {tool.category}
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
                                            <Link href={`/tools/${tool.id}/edit`} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(tool.id)} className="text-destructive focus:text-destructive cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    {tool.serialNumber && (
                                        <div className="flex items-center text-muted-foreground gap-2">
                                            <span className="font-medium text-xs uppercase tracking-wider">SN:</span>
                                            <span className="truncate">{tool.serialNumber}</span>
                                        </div>
                                    )}
                                    {tool.brand && (
                                        <div className="flex items-center text-muted-foreground gap-2">
                                            <span className="font-medium text-xs uppercase tracking-wider">Marca/Mod:</span>
                                            <span className="truncate">{tool.brand} {tool.model}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                                    <Badge variant={tool.active ? "default" : "secondary"} className="font-normal text-xs">
                                        {tool.active ? t("status.active") : t("status.inactive")}
                                    </Badge>
                                    
                                    {(() => {
                                        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                                        let statusLabel = tool.status;
                                        
                                        switch(tool.status) {
                                            case "AVAILABLE": 
                                                variant = "default"; 
                                                statusLabel = tTool("form.statusAvailable");
                                                break;
                                            case "IN_USE": 
                                                variant = "secondary"; 
                                                statusLabel = tTool("form.statusInUse");
                                                break;
                                            case "MAINTENANCE": 
                                                variant = "outline"; 
                                                statusLabel = tTool("form.statusMaintenance");
                                                break;
                                            case "LOST": 
                                                variant = "destructive"; 
                                                statusLabel = tTool("form.statusLost");
                                                break;
                                            case "DAMAGED": 
                                                variant = "destructive"; 
                                                statusLabel = tTool("form.statusDamaged");
                                                break;
                                        }
                                        return (
                                            <Badge variant={variant} className="font-normal text-xs">
                                                {statusLabel}
                                            </Badge>
                                        )
                                    })()}
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
                            <Link href={`/tools?page=${page - 1}${viewMode ? `&view=${viewMode}` : ''}`}>Anterior</Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page >= totalPages}
                            asChild
                        >
                            <Link href={`/tools?page=${page + 1}${viewMode ? `&view=${viewMode}` : ''}`}>Próxima</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
