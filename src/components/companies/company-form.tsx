"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, CompanyFormValues } from "@/schemas/company-schema"
import { createCompany, updateCompany } from "@/actions/company-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { DocumentForm } from "@/components/common/document-form"
import { AddressForm } from "@/components/common/address-form"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CompanyFormProps {
    initialData?: CompanyFormValues
    mode: "create" | "edit"
}

export function CompanyForm({ initialData, mode }: CompanyFormProps) {
    const t = useTranslations("Companies.form")
    const tCommon = useTranslations("Common")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: initialData || {
            name: "",
            slug: "",
            tradeName: "",
            document: "",
            documentType: "CNPJ",
            email: "",
            phone: "",
            mobile: "",
            whatsapp: "",
            website: "",
            distributionModel: "LIVRE",
            portalMode: "LISTING",
            enableCommissionControl: true,
            active: true,

            // Address defaults
            zip: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            ibge: "",
        },
    })

    async function onSubmit(data: CompanyFormValues) {
        startTransition(async () => {
            const result = mode === "create"
                ? await createCompany(data)
                : await updateCompany(initialData!.id!, data);

            if (result.success) {
                router.push("/companies");
                router.refresh();
            } else {
                alert(tCommon("errorSaving")); // Replace with toast
                console.error(result.error);
            }
        });
    }

    // Auto-generate slug from name if creating
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name);
        if (mode === "create") {
            const slug = name.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
            form.setValue("slug", slug);
        }
    }

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t("basicInfo")}</h3>
                            <div className="space-y-6">
                                <DocumentForm
                                    legalNameField="name"
                                    onLegalNameChange={handleNameChange} // Custom handler to generate slug
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium">{t("contactInfo")}</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("email")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://" />
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
                                            <FormLabel>{t("phone")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormDescription>{t("slugHelp")}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">{tCommon("address")}</h3>
                            <AddressForm />
                        </div>

                        {/* Configurations */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium">{t("settings")}</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="distributionModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("distributionModel")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LIVRE">{t("modelFree")}</SelectItem>
                                                    <SelectItem value="RESTRITO">{t("modelRestricted")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="portalMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("portalMode")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LISTING">{t("modeListing")}</SelectItem>
                                                    <SelectItem value="CATALOG">{t("modeCatalog")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="enableCommissionControl"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t("enableCommission")}</FormLabel>
                                                <FormDescription>
                                                    {t("enableCommissionDesc")}
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{tCommon("status.active")}</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? tCommon("saving") : tCommon("save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
