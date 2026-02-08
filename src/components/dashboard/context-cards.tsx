"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Wrench, FileText, DollarSign, Users } from "lucide-react"
import { useTranslations } from "next-intl"

export function ContextCards() {
    const t = useTranslations("Dashboard.context")

    const contexts = [
        {
            title: t('operational'),
            description: t('operationalDesc'),
            icon: Shield,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500/50",
            shadow: "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
        },
        {
            title: t('maintenance'),
            description: t('maintenanceDesc'),
            icon: Wrench,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "hover:border-orange-500/50",
            shadow: "hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]"
        },
        {
            title: t('commercial'),
            description: t('commercialDesc'),
            icon: FileText,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "hover:border-purple-500/50",
            shadow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]"
        },
        {
            title: t('financial'),
            description: t('financialDesc'),
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "hover:border-green-500/50",
            shadow: "hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
        },
        {
            title: t('hr'),
            description: t('hrDesc'),
            icon: Users,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            border: "hover:border-pink-500/50",
            shadow: "hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)]"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {contexts.map((ctx, index) => (
                <Card
                    key={index}
                    className={`border-border/50 bg-card/40 backdrop-blur-sm cursor-pointer transition-all duration-300 ${ctx.border} ${ctx.shadow} group h-full`}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[160px]">
                        <div className={`p-3 rounded-2xl ${ctx.bg} group-hover:scale-110 transition-transform duration-300`}>
                            <ctx.icon className={`h-8 w-8 ${ctx.color}`} />
                        </div>
                        <div className="space-y-2">
                            <span className="font-bold text-lg text-foreground/90 group-hover:text-foreground transition-colors block leading-tight">
                                {ctx.title}
                            </span>
                            {ctx.description && (
                                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                                    {ctx.description}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
