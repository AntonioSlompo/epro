"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MoneyInput } from "@/components/ui/money-input"
import { PageHeader } from "@/components/ui/page-header"

export default function MoneyDemoPage() {
    const t = useTranslations("MoneyDemo")
    const [value, setValue] = useState<string | undefined>("")
    const [rawValue, setRawValue] = useState<string | undefined>("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert(`Valor formatado: ${value}\nValor bruto: ${rawValue}`)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("title")}
                description={t("description")}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t("cardTitle")}</CardTitle>
                    <CardDescription>{t("cardDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="price">{t("label")}</Label>
                            <MoneyInput
                                id="price"
                                placeholder={t("placeholder")}
                                value={value}
                                onValueChange={(value, name, values) => {
                                    setValue(value)
                                    setRawValue(values?.float?.toString())
                                }}
                            />
                            <p className="text-sm text-muted-foreground">
                                {t("helperText")}: {rawValue}
                            </p>
                        </div>

                        <Button type="submit">{t("submit")}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
