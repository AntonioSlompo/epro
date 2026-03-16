"use client"

import { useTransition, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { createTechnician, updateTechnician, getAvailableUsersForTechnician } from "@/actions/technician-actions"
import { technicianSchema, type TechnicianFormValues } from "@/schemas/technician-schema"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    User, 
    Briefcase, 
    Phone, 
    ShieldCheck
} from "lucide-react"

interface TechnicianFormProps {
    initialData?: any;
}

export function TechnicianForm({ initialData }: TechnicianFormProps) {
    const t = useTranslations("Common")
    const tTech = useTranslations("Technicians.form")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [availableUsers, setAvailableUsers] = useState<any[]>([])

    const isEditing = !!initialData

    const form = useForm<any>({
        resolver: zodResolver(technicianSchema),
        defaultValues: initialData || {
            name: "",
            document: "",
            email: "",
            phone: "",
            mobile: "",
            department: "",
            specialties: "",
            notes: "",
            active: true,
            userId: null,
        },
    })

    useEffect(() => {
        async function fetchUsers() {
            const res = await getAvailableUsersForTechnician()
            if (res.success) {
                setAvailableUsers(res.users)
            }
        }
        fetchUsers()
    }, [])

    async function onSubmit(data: any) {
        startTransition(async () => {
            // Se userId for "none", converter para null antes de salvar
            const payload = { 
                ...data, 
                active: data.active ?? true,
                userId: data.userId === "none" ? null : data.userId 
            }
            
            const action = isEditing ? updateTechnician.bind(null, initialData.id, payload) : createTechnician.bind(null, payload);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tTech("updateSuccess") : tTech("createSuccess"));
                router.push("/technicians");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    const country = 'Brasil'; // Assuming default Brazil format
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* 1. Identificação */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {tTech("identification")}
                        </CardTitle>
                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                                        {tTech("active")}
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{t("name")} *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: João da Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="document"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CPF / RG</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Documento de Identificação" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                </Card>

                {/* 2. Formas de Contato */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            {tTech("contact")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{t("email")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@exemplo.com" type="email" {...field} value={field.value || ''} />
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
                                        <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} onChange={handlePhoneChange('mobile')} />
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
                                    <FormLabel>Telefone Fixo / Recado</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(00) 0000-0000" {...field} value={field.value || ''} onChange={handlePhoneChange('phone')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 3. Dados Profissionais */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" />
                            {tTech("professional")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tTech("department")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Câmeras, Redes, Ti" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="specialties"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tTech("specialties")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Fibra Óptica, CFTV, Alarme" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTech("internalNotes")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={tTech("notesPlaceholder")} {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 4. Acesso ao Sistema */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            {tTech("systemAccess")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTech("linkUserLabel")}</FormLabel>
                                    <FormDescription>
                                        {tTech("systemAccessDesc")}
                                    </FormDescription>
                                    <FormControl>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            // Handle the initial state explicitly since standard is empty string but db expects null or String
                                            defaultValue={field.value || "none"}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={tTech("selectUser")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-muted-foreground italic">
                                                    {tTech("noUserLinked")}
                                                </SelectItem>
                                                {availableUsers.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name || user.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4 pt-10">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/technicians")}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={isPending} className="px-8 font-semibold">
                        {isPending ? t("saving") : (isEditing ? t("saveChanges") : t("create"))}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
