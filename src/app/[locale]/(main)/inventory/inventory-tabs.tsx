"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { balanceColumns, transactionColumns } from "./columns";

interface InventoryTabsProps {
    initialBalances: any[];
    initialTransactions: any[];
    totalPages: number;
    currentPage: number;
    currentTab: string;
    search: string;
}

export function InventoryTabs({ 
    initialBalances, 
    initialTransactions, 
    totalPages, 
    currentPage, 
    currentTab,
}: InventoryTabsProps) {
    return (
        <Tabs value={currentTab} className="w-full h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <TabsContent value="balances" className="h-full mt-0 outline-none data-[state=inactive]:hidden flex flex-col">
                    <DataTable
                        columns={balanceColumns}
                        data={initialBalances}
                        totalPages={totalPages}
                        page={currentPage}
                    />
                </TabsContent>

                <TabsContent value="transactions" className="h-full mt-0 outline-none data-[state=inactive]:hidden flex flex-col">
                    <DataTable
                        columns={transactionColumns}
                        data={initialTransactions}
                        totalPages={totalPages}
                        page={currentPage}
                    />
                </TabsContent>
            </div>
        </Tabs>
    );
}
