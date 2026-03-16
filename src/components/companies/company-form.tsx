"use client"

import { useTransition, useState, useRef } from "react"
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
import { Camera, Building2, MapPin, Phone, Settings } from "lucide-react"

interface CompanyFormProps {
    initialData?: CompanyFormValues
    mode: "create" | "edit"
}

export function CompanyForm({ initialData, mode }: CompanyFormProps) {
    const t = useTranslations("Companies.form")
    const tCommon = useTranslations("Common")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [preview, setPreview] = useState<string | null>((initialData as any)?.logoBase64 ?? (initialData as any)?.logoUrl ?? null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: (initialData ? {
            ...initialData,
            tradeName: initialData.tradeName ?? "",
            document: (initialData as any).cnpj ?? initialData.document ?? "",
            documentType: "CNPJ",
            stateRegistration: initialData.stateRegistration ?? "",
            email: initialData.email ?? "",
            phone: initialData.phone ?? "",
            mobile: (initialData as any).mobile ?? "",
            whatsapp: (initialData as any).whatsapp ?? "",
            website: (initialData as any).website ?? "",
            logoUrl: (initialData as any).logoUrl ?? "",
            logoBase64: (initialData as any).logoBase64 ?? "",

            zip: (initialData as any).cep ?? initialData.zip ?? "",
            street: (initialData as any).address ?? initialData.street ?? "",
            number: initialData.number ?? "",
            complement: initialData.complement ?? "",
            neighborhood: initialData.neighborhood ?? "",
            city: initialData.city ?? "",
            state: initialData.state ?? "",

            planId: (initialData as any).planId ?? "",
        } : {
            name: "",
            slug: "",
            tradeName: "",
            document: "", 
            documentType: "CNPJ",
            stateRegistration: "",
            email: "",
            phone: "",
            mobile: "",
            whatsapp: "",
            website: "",
            distributionModel: "LIVRE",
            portalMode: "LISTING",
            enableCommissionControl: true,
            active: true,

            zip: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            ibge: "",

            planId: "",
            logoUrl: "",
            logoBase64: "",
        }) as any,
    })

    async function onSubmit(data: import("zod").infer<typeof companySchema>) {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 150 * 1024) {
                alert("O tamanho da imagem não pode ultrapassar 150 KB.");
                e.target.value = "";
                return;
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setPreview(base64String)
                form.setValue("logoBase64", base64String, { shouldDirty: true })
            }
            reader.readAsDataURL(file)
        }
    }

    const country = form.watch("country") || "Brasil";
    const isBrazil = country.toLowerCase() === 'brasil' || country.toLowerCase() === 'brazil';

    const handlePhoneChange = (fieldName: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (isBrazil) {
            value = value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
            if (value.length > 11) value = value.slice(0, 11);
            
            // Format to (XX) XXXXX-XXXX
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        }
        form.setValue(fieldName, value, { shouldValidate: true });
    };

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Logo Upload Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative h-32 w-32">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted bg-muted flex items-center justify-center relative shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Logo Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-muted-foreground">🏢</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <FormField
                                control={form.control}
                                name="logoBase64"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" /> {t("basicInfo")}
                            </h3>
                            <div className="space-y-6">
                                <DocumentForm
                                    legalNameField="name"
                                    onLegalNameChange={handleNameChange} // Custom handler to generate slug
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" /> {tCommon("address")}
                            </h3>
                            <AddressForm />
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Phone className="w-5 h-5 text-primary" /> {t("contactInfo")}
                            </h3>
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
                                                <Input 
                                                    {...field} 
                                                    value={field.value || ""}
                                                    onChange={handlePhoneChange('phone')} 
                                                    placeholder={isBrazil ? "(00) 0000-0000" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Celular</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    value={field.value || ""}
                                                    onChange={handlePhoneChange('mobile')} 
                                                    placeholder={isBrazil ? "(00) 00000-0000" : ""}
                                                />
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
                                                <Input 
                                                    {...field} 
                                                    value={field.value || ""}
                                                    onChange={handlePhoneChange('whatsapp')} 
                                                    placeholder={isBrazil ? "(00) 00000-0000" : ""}
                                                />
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

                        {/* Configurations */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" /> {t("settings")}
                            </h3>
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
