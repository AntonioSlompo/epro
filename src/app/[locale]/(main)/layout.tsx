import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getCurrentUser } from "@/actions/auth-actions"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Background Grid for Dashboard (Optional to keep consistent or reduce noise) */}
            <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            <Topbar user={user} />

            <div className="flex-1 flex overflow-hidden relative z-10">
                <Sidebar />
                <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="w-full flex-1 flex flex-col space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
