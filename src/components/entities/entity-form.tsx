"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { createEntity, updateEntity } from "@/actions/entity-actions";
import { entitySchema, type EntityFormValues } from "@/schemas/entity-schema";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { Users, FileText, MapPin, Phone, Landmark, Coins } from "lucide-react";
import { DocumentForm } from "@/components/common/document-form";
import { AddressForm } from "@/components/common/address-form";
import { formatPhone, formatMobile } from "@/lib/validators";

interface EntityFormProps {
    initialData?: any;
}

export function EntityForm({ initialData }: EntityFormProps) {
    const t = useTranslations("Common");
    const tEnt = useTranslations("Entities.form");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isEditing = !!initialData;

    const form = useForm<z.input<typeof entitySchema>>({
        resolver: zodResolver(entitySchema),
        defaultValues: initialData ? {
            ...initialData,
            tradeName: initialData.tradeName || "",
            stateRegistration: initialData.stateRegistration || "",
            municipalRegistration: initialData.municipalRegistration || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            mobile: initialData.mobile || "",
            website: initialData.website || "",
            zip: initialData.zip || "",
            street: initialData.street || "",
            number: initialData.number || "",
            complement: initialData.complement || "",
            neighborhood: initialData.neighborhood || "",
            city: initialData.city || "",
            state: initialData.state || "",
            referencePoint: initialData.referencePoint || "",
            operatingHours: initialData.operatingHours || "",
            bankName: initialData.bankName || "",
            agency: initialData.agency || "",
            account: initialData.account || "",
            accountType: initialData.accountType || "",
            pixKey: initialData.pixKey || "",
            standardPaymentCondition: initialData.standardPaymentCondition || "",
            responsibleConsultant: initialData.responsibleConsultant || "",
        } : {
            isCustomer: false,
            isSupplier: false,
            active: true,
            documentType: "CNPJ",
            document: "",
            name: "",
            tradeName: "",
            stateRegistration: "",
            municipalRegistration: "",
            birthDateOrFoundation: null,
            email: "",
            phone: "",
            mobile: "",
            website: "",
            zip: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            referencePoint: "",
            operatingHours: "",
            bankName: "",
            agency: "",
            account: "",
            accountType: "",
            pixKey: "",
            creditLimit: null,
            standardPaymentCondition: "",
            responsibleConsultant: "",
        },
    });

    const isCustomer = form.watch("isCustomer");
    const isSupplier = form.watch("isSupplier");
    const documentType = form.watch("documentType");
    const isCNPJ = documentType === "CNPJ";

    const titlePrefix = isEditing ? t("edit") : t("create");

    async function onSubmit(data: z.input<typeof entitySchema>) {
        startTransition(async () => {
            const action = isEditing ? updateEntity.bind(null, initialData.id, data) : createEntity.bind(null, data);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tEnt("updateSuccess") : tEnt("createSuccess"));
                router.push("/entities");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Tipo de Entidade & Status */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {tEnt("entityType")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <FormField
                                control={form.control}
                                name="isCustomer"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {tEnt("isCustomer")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tEnt("isCustomerDesc")}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="isSupplier"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                {tEnt("isSupplier")}
                                            </FormLabel>
                                            <FormDescription>
                                                {tEnt("isSupplierDesc")}
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {form.formState.errors.isCustomer && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.isCustomer.message}</p>
                        )}
                        
                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t("active")}</FormLabel>
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
                    </CardContent>
                </Card>

                {/* Dados Fiscais */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {tEnt("fiscalData")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DocumentForm 
                            legalNameField="name"
                            tradeNameField="tradeName"
                            documentField="document"
                            stateRegistrationField="stateRegistration"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <FormField
                                control={form.control}
                                name="municipalRegistration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inscrição Municipal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Número" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="birthDateOrFoundation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isCNPJ ? "Data de Abertura" : "Data de Nascimento"}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="date" 
                                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            {tEnt("addressData")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <AddressForm />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <FormField
                                control={form.control}
                                name="referencePoint"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Ponto de Referência</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Perto do mercado X" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {isCNPJ && (
                                <FormField
                                    control={form.control}
                                    name="operatingHours"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Horário de Funcionamento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Segunda à Sexta, 08:00 as 18:00" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contato */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            {tEnt("contactData")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("email")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@exemplo.com" {...field} value={field.value || ""} />
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
                                            placeholder="(00) 0000-0000" 
                                            {...field} 
                                            value={field.value || ""} 
                                            onChange={(e) => field.onChange(formatPhone(e.target.value))}
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
                                            placeholder="(00) 00000-0000" 
                                            {...field} 
                                            value={field.value || ""} 
                                            onChange={(e) => field.onChange(formatMobile(e.target.value))}
                                        />
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
                                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Dados Bancários */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-primary" />
                            {tEnt("bankingData")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banco</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Itaú, Nubank" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pixKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chave PIX</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chave do recebedor" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agência (com dígito)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 0001" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="account"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta Corrente (com dígito)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 12345-6" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Dados Financeiros - Apenas se for fornecedor */}
                {isSupplier && (
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-primary" />
                                {tEnt("financialData")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="creditLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limite de Crédito</FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                value={field.value ?? 0}
                                                onChange={(value) => field.onChange(value)}
                                                placeholder="R$ 0,00"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="standardPaymentCondition"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Condição de Pagamento Padrão</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: 30 dias, 30/60/90" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="responsibleConsultant"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Vendedor/Consultor Responsável</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do contato comercial" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t("saving") : t("save")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
