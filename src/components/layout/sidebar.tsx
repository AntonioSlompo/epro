"use client"

import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from "next-intl"
import {
    LayoutDashboard,
    Users,
    DollarSign,
    Settings,
    Building2,
    Crown,
    Truck,
    FlaskConical,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    LayoutGrid,
    Car,
    Wrench,
    Store,
    Hammer,
    Package
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { useDashboard } from "@/context/dashboard-context"
import { TenantSelector } from "@/components/layout/tenant-selector"

interface SidebarProps {
    user?: {
        name: string | null;
        email: string;
        image: string | null;
        role: string;
        companies: any[];
    } | null;
    currentTenantId?: string;
}

export function Sidebar({ user, currentTenantId }: SidebarProps) {
    const t = useTranslations("Dashboard.nav")
    const { contexts, selectedContext, setSelectedContext } = useDashboard()
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    const [expandedItems, setExpandedItems] = useState<string[]>(['Playground'])

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const allNavItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: t('dashboard') },
        { href: "/users", icon: Users, label: t('users') },
        { href: "/entities", icon: Store, label: t('entities') },
        { href: "/storage-locations", icon: Package, label: t('storageLocations') },
        { href: "/technicians", icon: Wrench, label: t('technicians') },
        { href: "/products", icon: LayoutGrid, label: t('products') },
        { href: "/vehicles", icon: Car, label: t('vehicles') },
        { href: "/tools", icon: Hammer, label: t('tools') },
        { href: "/companies", icon: Building2, label: t('companies') },
        { href: "/owner", icon: Crown, label: t('owner') },
        { href: "/finance", icon: DollarSign, label: t('finance') },
        {
            label: t('playground'),
            icon: FlaskConical,
            children: [
                { href: "/document-demo", label: t('documentDemo') },
                { href: "/address-demo", label: t('addressDemo') },
                { href: "/money-demo", label: t('moneyDemo') },
                { href: "/file-upload-demo", label: t('fileUploadDemo') },
            ]
        },
        { href: "/settings", icon: Settings, label: t('settings') },
    ]

    const navItems = user?.role === 'SUPER_ADMIN' 
        ? allNavItems.filter(item => ['/users', '/companies', '/owner', '/settings'].includes(item.href || ''))
        : allNavItems.filter(item => item.href !== '/owner' && item.href !== '/companies');

    return (
        <>
            {/* Mobile Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-4 left-4 z-50"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X /> : <Menu />}
            </Button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 bg-card/60 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out md:static md:inset-auto md:h-[calc(100vh-4rem)] shrink-0 overflow-y-auto overflow-x-hidden",
                isMobileOpen ? "translate-x-0 top-16 h-[calc(100vh-4rem)] w-64" : "-translate-x-full md:translate-x-0",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <div className="flex flex-col h-full pt-4">



                    {/* Context Switcher - Hidden on Dashboard with transition */}
                    {user?.role !== 'SUPER_ADMIN' && (
                        <div className={cn(
                            "px-3 transition-all duration-300 ease-in-out overflow-hidden",
                            isCollapsed && "px-2",
                            pathname === '/dashboard' ? "max-h-0 opacity-0 mb-0" : "max-h-20 opacity-100 mb-2"
                        )}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-between h-10 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all",
                                            isCollapsed && "justify-center px-0 bg-transparent border-transparent hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <selectedContext.icon className={cn("h-4 w-4", selectedContext.color)} />
                                            {!isCollapsed && (
                                                <span className="truncate">{selectedContext.title}</span>
                                            )}
                                        </div>
                                        {!isCollapsed && <ChevronDown className="h-3 w-3 opacity-50" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[14rem] bg-background/95 backdrop-blur-sm border-border ml-2">
                                    <DropdownMenuLabel>Navegar por Contexto</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {contexts.map((ctx, index) => (
                                        <DropdownMenuItem
                                            key={index}
                                            className="gap-3 cursor-pointer"
                                            onClick={() => setSelectedContext(ctx)}
                                        >
                                            <div className={`p-1.5 rounded-md ${ctx.bg}`}>
                                                <ctx.icon className={`h-4 w-4 ${ctx.color}`} />
                                            </div>
                                            <span>{ctx.title}</span>
                                            {selectedContext.title === ctx.title && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-2">
                        {navItems.map((item, index) => {
                            if (item.children) {
                                const isExpanded = expandedItems.includes(item.label)
                                const isActive = item.children.some(child => pathname === child.href)

                                return (
                                    <div key={index} className="space-y-1">
                                        <button
                                            onClick={() => toggleExpand(item.label)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative select-none",
                                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                                isCollapsed && "justify-center px-2"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-5 w-5 transition-colors shrink-0",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                            )} />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="font-medium truncate flex-1 text-left">
                                                        {item.label}
                                                    </span>
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </>
                                            )}
                                        </button>

                                        {!isCollapsed && isExpanded && (
                                            <div className="pl-11 pr-2 space-y-1">
                                                {item.children.map((child) => {
                                                    const isChildActive = pathname === child.href
                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            className={cn(
                                                                "block py-2 px-3 text-sm rounded-md transition-colors",
                                                                isChildActive
                                                                    ? "bg-primary/10 text-primary font-medium"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                            )}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-[0_0_10px_-5px_var(--color-primary)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors shrink-0",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                    {!isCollapsed && (
                                        <span className="font-medium truncate transition-opacity duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--color-primary)]" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Collapse Toggle */}
                    <div className="p-4 border-t border-white/10 flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex ml-auto hover:bg-white/10"
                        >
                            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    )
}
