"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { upsertOwner } from "@/actions/owner-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { DocumentForm } from "@/components/common/document-form"
import { AddressForm } from "@/components/common/address-form"
import { Building2, Phone, MapPin, Landmark } from "lucide-react"

// Client-side schema matching the server schema
const formSchema = z.object({
    name: z.string().min(1, "Razão Social é obrigatória"),
    tradeName: z.string().optional().nullable(),
    cnpj: z.string().min(14, "CNPJ inválido"),
    documentType: z.string().default("CNPJ"), // Used by DocumentForm
    stateRegistration: z.string().optional().nullable(),
    municipalRegistration: z.string().optional().nullable(),
    email: z.string().email("E-mail inválido").optional().nullable(),
    phone: z.string().optional().nullable(),
    mobile: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    number: z.string().optional().nullable(),
    complement: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    agency: z.string().optional().nullable(),
    account: z.string().optional().nullable(),
    accountType: z.string().optional().nullable(),
    pixKey: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
})

interface OwnerFormProps {
    initialData?: any
}

export function OwnerForm({ initialData }: OwnerFormProps) {
    const tCommon = useTranslations("Common")
    // Assuming we might not have specific translations for Owner yet, falling back to generic where possible
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            tradeName: initialData?.tradeName || "",
            cnpj: initialData?.cnpj || "",
            documentType: "CNPJ",
            stateRegistration: initialData?.stateRegistration || "",
            municipalRegistration: initialData?.municipalRegistration || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            mobile: initialData?.mobile || "",
            website: initialData?.website || "",
            zip: initialData?.zip || "",
            street: initialData?.street || "",
            number: initialData?.number || "",
            complement: initialData?.complement || "",
            neighborhood: initialData?.neighborhood || "",
            city: initialData?.city || "",
            state: initialData?.state || "",
            bankName: initialData?.bankName || "",
            agency: initialData?.agency || "",
            account: initialData?.account || "",
            accountType: initialData?.accountType || "",
            pixKey: initialData?.pixKey || "",
            country: initialData?.country || "Brasil",
            latitude: initialData?.latitude || undefined,
            longitude: initialData?.longitude || undefined,
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            // Strip client-only DocumentForm fields before sending
            const { documentType, ...submitData } = data;
            
            const result = await upsertOwner(submitData);

            if (result.success) {
                alert("Dados salvos com sucesso!"); // Replace with proper toast
                router.refresh();
            } else {
                alert(result.error || tCommon("errorSaving"));
            }
        });
    }

    const country = form.watch('country') || 'Brasil';
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

    const scrollToSection = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without jumping
        window.history.pushState(null, '', `#${id}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <aside className="w-full md:w-56 shrink-0 sticky top-24">
                <div className="mb-4 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Navegação Rápida
                </div>
                <nav className="flex flex-col space-y-1">
                    <Button variant="ghost" className="justify-start hover:bg-muted" asChild>
                        <a href="#legal" onClick={scrollToSection('legal')}><Building2 className="w-4 h-4 mr-2" /> Jurídico</a>
                    </Button>
                    <Button variant="ghost" className="justify-start hover:bg-muted" asChild>
                        <a href="#address" onClick={scrollToSection('address')}><MapPin className="w-4 h-4 mr-2" /> Endereço</a>
                    </Button>
                    <Button variant="ghost" className="justify-start hover:bg-muted" asChild>
                        <a href="#contact" onClick={scrollToSection('contact')}><Phone className="w-4 h-4 mr-2" /> Contato</a>
                    </Button>
                    <Button variant="ghost" className="justify-start hover:bg-muted" asChild>
                        <a href="#banking" onClick={scrollToSection('banking')}><Landmark className="w-4 h-4 mr-2" /> Bancário</a>
                    </Button>
                </nav>
            </aside>

            <div className="flex-1 w-full min-w-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Jurídico */}
                        <Card id="legal" className="border-border/50 bg-card/40 backdrop-blur-sm scroll-mt-24">
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" /> Dados Jurídicos
                                </h3>
                                <DocumentForm
                                    legalNameField="name"
                                    tradeNameField="tradeName"
                                    documentField="cnpj"
                                    stateRegistrationField="stateRegistration"
                                    allowedDocumentTypes={['CNPJ']}
                                />
                                <div className="grid gap-6 md:grid-cols-2 mt-6">
                                    <FormField
                                        control={form.control}
                                        name="municipalRegistration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Inscrição Municipal</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Endereço */}
                        <Card id="address" className="border-border/50 bg-card/40 backdrop-blur-sm scroll-mt-24">
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" /> Endereço
                                </h3>
                                <AddressForm />
                            </CardContent>
                        </Card>

                        {/* Contato */}
                        <Card id="contact" className="border-border/50 bg-card/40 backdrop-blur-sm scroll-mt-24">
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-primary" /> Contato
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tCommon("email")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="email" value={field.value || ""} />
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
                                                <FormLabel>Site</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="https://" value={field.value || ""} />
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
                                                <FormLabel>{tCommon("phone")}</FormLabel>
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
                                                <FormLabel>Celular / WhatsApp</FormLabel>
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
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bancário */}
                        <Card id="banking" className="border-border/50 bg-card/40 backdrop-blur-sm scroll-mt-24">
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-primary" /> Dados Bancários
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Banco</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ex: Nu Pagamentos S.A." value={field.value || ""} />
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
                                                <FormLabel>Agência</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ex: 0001" value={field.value || ""} />
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
                                                <FormLabel>Conta</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Conta</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Corrente, Poupança..." value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pixKey"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Chave PIX</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="CNPJ, E-mail, Celular ou Aleatória" value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-4 pb-20">
                            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                                {isPending ? tCommon("saving") : tCommon("save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
