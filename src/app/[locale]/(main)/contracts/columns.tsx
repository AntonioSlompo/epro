"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Copy, Trash2, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteContract } from "@/actions/contract-actions";

const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

export type ContractColumn = {
    id: string;
    contractNumber: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    billingDay: number;
    customer: {
        name: string;
        tradeName: string | null;
    };
    items: any[];
};

const ActionCell = ({ row }: { row: any }) => {
    const t = useTranslations("Common");
    const tCon = useTranslations("Contracts");
    const contract = row.original;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("actions")}</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        navigator.clipboard.writeText(contract.id);
                        toast.success("ID copiado");
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    {t("copyId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={`/contracts/${contract.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={async () => {
                        if (confirm(tCon("deleteConfirm") || "Tem certeza que deseja excluir?")) {
                            const result = await deleteContract(contract.id);
                            if (result.success) {
                                toast.success(tCon("form.deleteSuccess") || "Excluído com sucesso!");
                            } else {
                                toast.error(result.error || t("error"));
                            }
                        }
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const StatusCell = ({ row }: { row: any }) => {
    const t = useTranslations("Contracts");
    const status = row.original.status as keyof typeof statusLabels;
    
    const statusLabels: Record<string, string> = {
        ACTIVE: t("statuses.ACTIVE"),
        DRAFT: t("statuses.DRAFT"),
        SUSPENDED: t("statuses.SUSPENDED"),
        CANCELED: t("statuses.CANCELED"),
        EXPIRED: t("statuses.EXPIRED")
    };

    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status) {
        case "ACTIVE":
            variant = "default";
            break;
        case "SUSPENDED":
            variant = "secondary";
            break;
        case "CANCELED":
            variant = "destructive";
            break;
        case "EXPIRED":
            variant = "secondary";
            break;
    }

    return <Badge variant={variant}>{statusLabels[status] || status}</Badge>;
};

const Header = ({ labelKey }: { labelKey: string }) => {
    const t = useTranslations("Contracts");
    return <span>{t(labelKey)}</span>;
};

export const columns: ColumnDef<ContractColumn>[] = [
    {
        accessorKey: "contractNumber",
        header: () => <Header labelKey="contractNumber" />,
        cell: ({ row }) => (
            <Link 
                href={`/contracts/${row.original.id}/edit`} 
                className="font-medium hover:underline text-primary"
            >
                {row.original.contractNumber}
            </Link>
        ),
    },
    {
        accessorKey: "customer.name",
        header: () => <Header labelKey="customer" />,
        cell: ({ row }) => {
            const customer = row.original.customer;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{customer.name}</span>
                    {customer.tradeName && (
                        <span className="text-xs text-muted-foreground">{customer.tradeName}</span>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: "status",
        header: () => <Header labelKey="status" />,
        cell: StatusCell,
    },
    {
        accessorKey: "startDate",
        header: () => <Header labelKey="startDate" />,
        cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
        accessorKey: "billingDay",
        header: () => <Header labelKey="billingDay" />,
    },
    {
        id: "actions",
        cell: ActionCell,
    },
];
