"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { createTool, updateTool } from "@/actions/tool-actions"
import { toolSchema, type ToolFormValues } from "@/schemas/tool-schema"

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    Hammer, 
    Tag, 
    Info, 
} from "lucide-react"

interface ToolFormProps {
    initialData?: any;
}

export function ToolForm({ initialData }: ToolFormProps) {
    const t = useTranslations("Common")
    const tTool = useTranslations("Tools.form")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const isEditing = !!initialData

    const form = useForm<any>({
        resolver: zodResolver(toolSchema),
        defaultValues: initialData || {
            name: "",
            serialNumber: "",
            brand: "",
            model: "",
            category: "",
            status: "AVAILABLE",
            notes: "",
            active: true,
        },
    })

    async function onSubmit(data: ToolFormValues) {
        startTransition(async () => {
            const action = isEditing ? updateTool.bind(null, initialData.id, data) : createTool.bind(null, data);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tTool("updateSuccess") : tTool("createSuccess"));
                router.push("/tools");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* 1. Identificação */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Hammer className="w-5 h-5 text-primary" />
                            {tTool("identification")}
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
                                        {tTool("active")}
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
                                        <Input placeholder="Ex: Furadeira Bosch" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serialNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTool("serialNumber")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nº de Série / Patrimônio" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTool("category")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Elétrica, Manual, Medição" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 2. Detalhes do Equipamento */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" />
                            {tTool("details")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTool("brand")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Bosch, Dewalt, Fluke" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTool("model")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: GSB 13 RE" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{tTool("status")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">{tTool("statusAvailable")}</SelectItem>
                                            <SelectItem value="IN_USE">{tTool("statusInUse")}</SelectItem>
                                            <SelectItem value="MAINTENANCE">{tTool("statusMaintenance")}</SelectItem>
                                            <SelectItem value="LOST">{tTool("statusLost")}</SelectItem>
                                            <SelectItem value="DAMAGED">{tTool("statusDamaged")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 3. Observações */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            {tTool("observations")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tTool("internalNotes")}</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder={tTool("notesPlaceholder")} 
                                            className="min-h-[120px]"
                                            {...field} 
                                            value={field.value || ''} 
                                        />
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
                        onClick={() => router.push("/tools")}
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
