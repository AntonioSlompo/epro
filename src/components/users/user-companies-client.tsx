"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Loader2, Plus, Trash2 } from "lucide-react"

import { searchCompaniesByNameOrCnpj } from "@/actions/company-actions"
import { linkCompanyToUser, unlinkCompanyFromUser } from "@/actions/user-actions"

interface CompanyItem {
    id: string
    name: string
    cnpj?: string | null
    tradeName?: string | null
}

interface UserCompaniesClientProps {
    userId: string
    initialCompanies: CompanyItem[]
}

export function UserCompaniesClient({ userId, initialCompanies }: UserCompaniesClientProps) {
    const t = useTranslations("Users.companies")
    const router = useRouter()
    
    const [linkedCompanies, setLinkedCompanies] = useState<CompanyItem[]>(initialCompanies)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<CompanyItem[]>([])
    
    const [isSearching, startSearching] = useTransition()
    const [isLinking, startLinking] = useTransition()
    const [isUnlinking, startUnlinking] = useTransition()

    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.length < 2) return

        startSearching(async () => {
            const results = await searchCompaniesByNameOrCnpj(searchQuery)
            setSearchResults(results)
            setMessage(null)
        })
    }

    const handleLink = (company: CompanyItem) => {
        if (linkedCompanies.some(c => c.id === company.id)) {
            setMessage({ text: t("alreadyLinked"), type: 'error' })
            return
        }

        startLinking(async () => {
            const result = await linkCompanyToUser(userId, company.id)
            if (result.success) {
                setLinkedCompanies(prev => [...prev, company])
                setSearchResults(prev => prev.filter(c => c.id !== company.id))
                setMessage({ text: t("linkSuccess"), type: 'success' })
            } else {
                setMessage({ text: result.error || "Erro", type: 'error' })
            }
        })
    }

    const handleUnlink = (companyId: string) => {
        startUnlinking(async () => {
            const result = await unlinkCompanyFromUser(userId, companyId)
            if (result.success) {
                setLinkedCompanies(prev => prev.filter(c => c.id !== companyId))
                setMessage({ text: t("unlinkSuccess"), type: 'success' })
            } else {
                setMessage({ text: result.error || "Erro", type: 'error' })
            }
        })
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Left Side: Search and Link */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t("searchLabel")}</CardTitle>
                    <CardDescription>{t("searchPlaceholder")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isSearching || searchQuery.length < 2}>
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </form>

                    {message && (
                        <div className={`p-3 text-sm rounded-md ${message.type === 'success' ? 'bg-primary/20 text-primary-foreground' : 'bg-destructive/15 text-destructive'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
                        {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                            <p className="text-sm text-muted-foreground text-center py-4">{t("noCompaniesFound")}</p>
                        )}
                        {searchResults.map(company => (
                            <div key={company.id} className="flex items-center justify-between p-3 rounded-md border bg-background/50">
                                <div>
                                    <p className="font-medium text-sm">{company.name}</p>
                                    <p className="text-xs text-muted-foreground">{company.cnpj || company.tradeName || 'S/N'}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleLink(company)}
                                    disabled={isLinking || linkedCompanies.some(c => c.id === company.id)}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> {t("linkButton")}
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Right Side: Current Linked Companies */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t("currentCompanies")}</CardTitle>
                    <CardDescription>
                        {linkedCompanies.length} {linkedCompanies.length === 1 ? 'empresa vinculada' : 'empresas vinculadas'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {linkedCompanies.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">{t("noLinkedCompanies")}</p>
                        ) : (
                            linkedCompanies.map(company => (
                                <div key={company.id} className="flex items-center justify-between p-3 rounded-md border bg-primary/5">
                                    <div>
                                        <p className="font-medium text-sm">{company.name}</p>
                                        <p className="text-xs text-muted-foreground">{company.cnpj || company.tradeName || 'S/N'}</p>
                                    </div>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => handleUnlink(company.id)}
                                        disabled={isUnlinking}
                                    >
                                        {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
