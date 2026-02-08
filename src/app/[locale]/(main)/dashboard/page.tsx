import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { ContextCards } from "@/components/dashboard/context-cards"

export default function DashboardPage() {
    const t = useTranslations("Dashboard")

    // Mock Data
    const stats = [
        {
            title: t('stats.activeUsers'),
            value: "1,234",
            change: "+12%",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: t('stats.revenue'),
            value: "R$ 45.231,89",
            change: "+4.5%",
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: t('stats.alerts'),
            value: "7",
            change: "-2",
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            title: t('stats.occupancy'),
            value: "98.2%",
            change: "+0.1%",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-glow">{t('title')}</h1>
            </div>

            {/* Context Cards */}
            <div className="shrink-0">
                <ContextCards />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={stat.change.startsWith('+') ? "text-green-500" : "text-red-500"}>
                                    {stat.change}
                                </span>{" "}
                                {t('stats.lastMonth')}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity / Placeholder Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
                <Card className="col-span-4 border-border/50 bg-card/60 backdrop-blur-sm flex flex-col min-h-0">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">{t('recentActivity')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 overflow-auto">
                        <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-lg bg-black/20">
                            Chart or Table Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-border/50 bg-card/60 backdrop-blur-sm flex flex-col min-h-0">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">{t('systemHealth')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 overflow-auto">
                        <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-lg bg-black/20">
                            Status Placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
