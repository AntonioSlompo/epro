"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Copy, Trash2, FileText } from "lucide-react";
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
import { deleteContract } from "@/actions/contract-actions";

const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

interface ContractsTableProps {
    data: any[];
    totalPages: number;
    page: number;
    viewMode?: 'list' | 'card';
}

export function ContractsTable({ data, totalPages, page, viewMode }: ContractsTableProps) {
    const t = useTranslations("Common");
    const tCon = useTranslations("Contracts");

    const renderContractCard = (contract: any) => {
        const customer = contract.customer;
        
        let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
        switch (contract.status) {
            case "ACTIVE": statusVariant = "default"; break;
            case "SUSPENDED": statusVariant = "secondary"; break;
            case "CANCELED": statusVariant = "destructive"; break;
            case "EXPIRED": statusVariant = "secondary"; break;
        }

        return (
            <Card className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                <CardContent className="p-0 flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex gap-4 items-start border-b bg-muted/20">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-background border flex justify-center items-center shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold truncate" title={contract.contractNumber}>
                                {contract.contractNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">{customer.name}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(contract.id); toast.success("ID copiado"); }}>
                                    <Copy className="mr-2 h-4 w-4" /> {t("copyId")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/contracts/${contract.id}/edit`} className="flex items-center cursor-pointer">
                                        <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={async () => {
                                        if (confirm(tCon("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                                            const result = await deleteContract(contract.id);
                                            if (result.success) {
                                                toast.success("Excluído com sucesso!");
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

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center text-muted-foreground gap-2">
                                <span className="font-medium text-xs uppercase tracking-wider">Início:</span>
                                <span>{formatDate(contract.startDate)}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground gap-2">
                                <span className="font-medium text-xs uppercase tracking-wider">Dia Fat.:</span>
                                <span>{contract.billingDay}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2 justify-between items-center">
                            <Badge variant={statusVariant} className="font-normal text-xs">
                                {contract.status}
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
            renderCard={renderContractCard}
        />
    );
}
