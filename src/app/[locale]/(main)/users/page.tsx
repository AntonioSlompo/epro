
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Plus } from "lucide-react"
import { getUsers } from "@/actions/user-actions"
import { UsersTable } from "./users-table"

import { getTranslations } from "next-intl/server"

import { SearchInput } from "@/components/ui/search-input"

export default async function UsersPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const search = typeof searchParams.search === 'string' ? searchParams.search : ''
    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
    const { users, totalPages } = await getUsers({ page, limit: 10, search })
    const t = await getTranslations("Users")

    return (
        <div className="flex flex-col w-full h-full gap-8">
            <PageHeader
                title={t("title")}
                description={t("description")}
            >
                <SearchInput />
                <Button asChild className="gap-2">
                    <Link href="/users/new">
                        <Plus className="h-4 w-4" />
                        {t("addUser")}
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex-1 min-h-0">
                <UsersTable data={users} totalPages={totalPages} page={page} />
            </div>
        </div>
    )
}
