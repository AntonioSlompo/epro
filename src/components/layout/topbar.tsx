"use client"

import { usePathname } from '@/i18n/routing'
import {
    Bell,
    Shield,
    User,
    Wrench,
    FileText,
    DollarSign,
    Users,
    ChevronDown,
    LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { DensityToggle } from "@/components/density-toggle"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/actions/auth-actions"
import { useTranslations } from "next-intl"

interface TopbarProps {
    user?: {
        name: string | null;
        email: string;
        image: string | null;
    } | null;
}

export function Topbar({ user }: TopbarProps) {
    const t = useTranslations("UserMenu")
    const tContext = useTranslations("Dashboard.context")
    const pathname = usePathname()
    const isDashboard = pathname === '/dashboard'

    const contexts = [
        {
            title: tContext('operational'),
            icon: Shield,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: tContext('maintenance'),
            icon: Wrench,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: tContext('commercial'),
            icon: FileText,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: tContext('financial'),
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: tContext('hr'),
            icon: Users,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
        }
    ]

    return (
        <header className="h-16 w-full glass-panel flex items-center justify-between px-6 z-30 relative rounded-none border-x-0 border-t-0">
            {/* Left: Logo & Context Dropdown */}
            <div className="flex items-center gap-6 w-full max-w-xl">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary shadow-[0_0_15px_var(--color-primary)] flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-glow hidden md:block">E-PRO</span>
                </div>


            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Context Dropdown (Hidden on Dashboard) */}
                {!isDashboard && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-9 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                <LayoutGrid className="h-4 w-4" />
                                <span className="hidden md:inline-block">Contextos</span>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-border">
                            <DropdownMenuLabel>Navegar por Contexto</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {contexts.map((ctx, index) => (
                                <DropdownMenuItem key={index} className="gap-3 cursor-pointer">
                                    <div className={`p-1.5 rounded-md ${ctx.bg}`}>
                                        <ctx.icon className={`h-4 w-4 ${ctx.color}`} />
                                    </div>
                                    <span>{ctx.title}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                <LanguageToggle />
                <DensityToggle />
                <ModeToggle />

                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-background" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border border-primary/20 shadow-[0_0_10px_-5px_var(--color-primary)]">
                                <AvatarImage src={user?.image || "/avatars/01.png"} alt={user?.name || "@user"} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{t('profile')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('billing')}</DropdownMenuItem>
                        <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => logout()}>
                            {t('logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
