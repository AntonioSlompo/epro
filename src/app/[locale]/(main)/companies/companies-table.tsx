"use client"

import { DataTable } from "@/components/ui/data-table"
import { Company } from "@prisma/client"
import { useCompanyColumns } from "./columns"

interface CompaniesTableProps {
    data: Company[]
    totalPages: number
    page: number
}

export function CompaniesTable({ data, totalPages, page }: CompaniesTableProps) {
    const columns = useCompanyColumns();
    return <DataTable columns={columns} data={data} totalPages={totalPages} page={page} />
}
