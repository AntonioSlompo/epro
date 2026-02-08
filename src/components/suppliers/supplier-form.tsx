"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation" // Use next/navigation for app router
import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createSupplier, updateSupplier } from "@/actions/supplier-actions"
import { SupplierFormValues, supplierSchema } from "@/schemas/supplier-schema"

interface SupplierFormProps {
    initialData?: SupplierFormValues & { id?: string }
    mode: "create" | "edit"
}

export function SupplierForm({ initialData, mode }: SupplierFormProps) {
    const router = useRouter()
    const t = useTranslations("Suppliers.form")
    const tCommon = useTranslations("Common")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            active: true,
            address: "",
            city: "",
            zip: "",
        },
    })

    function onSubmit(data: SupplierFormValues) {
        setError(null)
        startTransition(async () => {
            let result
            if (mode === "edit" && initialData?.id) {
                result = await updateSupplier(initialData.id, data)
            } else {
                result = await createSupplier(data)
            }

            if (result.success) {
                router.push("/suppliers")
                router.refresh()
            } else {
                setError(typeof result.error === 'string' ? result.error : tCommon("error"))
            }
        })
    }

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("nameLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("namePlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("emailLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("emailPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("phoneLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("phonePlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("addressLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("addressPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("cityLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("cityPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("zipLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("zipPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? tCommon("saving") : mode === "create" ? t("createPayload") : tCommon("saveChanges")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
