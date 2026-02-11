"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { useDashboard } from "@/context/dashboard-context"
import { cn } from "@/lib/utils"

export function ContextCards() {
    const t = useTranslations("Dashboard.context")

    const { contexts, selectedContext, setSelectedContext } = useDashboard()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {contexts.map((ctx, index) => {
                const isSelected = selectedContext.title === ctx.title
                return (
                    <Card
                        key={index}
                        className={cn(
                            "border-border/50 bg-card/40 backdrop-blur-sm cursor-pointer transition-all duration-300 group h-full",
                            ctx.color,
                            isSelected
                                ? cn(ctx.selectedBorder, ctx.selectedShadow, ctx.selectedBg)
                                : cn("hover:bg-card/60", ctx.hoverBorder, ctx.hoverShadow)
                        )}
                        onClick={() => setSelectedContext(ctx)}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[160px]">
                            <div className={cn(
                                "p-3 rounded-2xl transition-transform duration-300",
                                ctx.bg,
                                isSelected ? "scale-110" : "group-hover:scale-110"
                            )}>
                                <ctx.icon className={cn("h-8 w-8", ctx.color)} />
                            </div>
                            <div className="space-y-2">
                                <span className={cn(
                                    "font-bold text-lg transition-colors block leading-tight",
                                    isSelected ? ctx.selectedColor : "text-foreground/90 group-hover:text-foreground"
                                )}>
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
                )
            })}
        </div>
    )
}
