"use client";

import { useTransition, useMemo, useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { createContract, updateContract } from "@/actions/contract-actions";
import { contractSchema, type ContractFormValues } from "@/schemas/contract-schema";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { FileText, Users, ShoppingCart, Calendar, Plus, Trash2 } from "lucide-react";

const Separator = () => <div className="h-[1px] w-full bg-border/50 my-4" />;

interface ContractFormProps {
    initialData?: any;
    customers: any[];
    products: any[];
}

export function ContractForm({ initialData, customers, products }: ContractFormProps) {
    const t = useTranslations("Common");
    const tCon = useTranslations("Contracts");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isEditing = !!initialData;

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: initialData ? {
            customerId: initialData.customerId,
            contractNumber: initialData.contractNumber,
            status: initialData.status,
            startDate: new Date(initialData.startDate),
            endDate: initialData.endDate ? new Date(initialData.endDate) : null,
            billingDay: initialData.billingDay,
            paymentCondition: initialData.paymentCondition || "",
            notes: initialData.notes || "",
            items: initialData.items.map((item: any) => ({
                id: item.id,
                productId: item.productId,
                quantity: Number(item.quantity || 1),
                unitPrice: Number(item.unitPrice || 0),
                discount: Number(item.discount || 0),
                total: Number(item.total || 0),
                description: item.description || "",
            })),
        } : {
            customerId: "",
            contractNumber: "",
            status: "DRAFT" as any,
            startDate: new Date(),
            endDate: null,
            billingDay: 1,
            paymentCondition: "",
            notes: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    async function onSubmit(data: ContractFormValues) {
        startTransition(async () => {
            const action = isEditing ? updateContract.bind(null, initialData.id, data) : createContract.bind(null, data);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tCon("form.updateSuccess") : tCon("form.createSuccess"));
                router.push("/contracts");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    const calculateItemTotal = (quantity: number, unitPrice: number, discount: number = 0) => {
        return (quantity * unitPrice) - (discount || 0);
    };

    const items = useWatch({
        control: form.control,
        name: "items",
    }) || [];

    const overallTotal = useMemo(() => {
        return (items as any[]).reduce((acc: number, item: any) => acc + (Number(item?.total) || 0), 0);
    }, [items]);

    return (
        <Form {...(form as any)}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                {/* Informações Básicas */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {tCon("form.basicInfo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{tCon("customer")}</FormLabel>
                                    <FormControl>
                                        <Combobox 
                                            options={customers.map(c => ({ label: c.name, value: c.id }))}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={tCon("selectCustomer")}
                                            searchPlaceholder={tCon("selectCustomer")}
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contractNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("contractNumber")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 2024-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("status")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">{tCon("statuses.DRAFT")}</SelectItem>
                                            <SelectItem value="ACTIVE">{tCon("statuses.ACTIVE")}</SelectItem>
                                            <SelectItem value="SUSPENDED">{tCon("statuses.SUSPENDED")}</SelectItem>
                                            <SelectItem value="CANCELED">{tCon("statuses.CANCELED")}</SelectItem>
                                            <SelectItem value="EXPIRED">{tCon("statuses.EXPIRED")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Itens do Contrato */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            {tCon("form.contractItems")}
                        </CardTitle>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => append({ 
                                productId: "", 
                                quantity: 1, 
                                unitPrice: 0, 
                                discount: 0, 
                                total: 0,
                                description: "" 
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {tCon("addItem")}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
                                {tCon("noItems")}
                            </div>
                        )}
                        {fields.map((field, index) => (
                            <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-background/50 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.productId`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>{tCon("selectProduct")}</FormLabel>
                                                <FormControl>
                                                    <Combobox 
                                                        options={products.map(p => ({ label: `${p.sku} - ${p.name}`, value: p.id }))}
                                                        value={field.value}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            const p = products.find(x => x.id === val);
                                                            if (p) {
                                                                const price = Number(p.suggestedSellingPrice || p.subscriptionPrice || 0);
                                                                form.setValue(`items.${index}.unitPrice` as any, price as any);
                                                                form.setValue(`items.${index}.total` as any, calculateItemTotal(form.getValues(`items.${index}.quantity` as any), price, form.getValues(`items.${index}.discount` as any)) as any);
                                                            }
                                                        }}
                                                        placeholder={tCon("selectProduct")}
                                                        searchPlaceholder={tCon("selectProduct")}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tCon("quantity")}</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        {...field} 
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            field.onChange(val);
                                                            form.setValue(`items.${index}.total` as any, calculateItemTotal(val, form.getValues(`items.${index}.unitPrice` as any), form.getValues(`items.${index}.discount` as any)) as any);
                                                        }} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tCon("unitPrice")}</FormLabel>
                                                <FormControl>
                                                    <MoneyInput
                                                        value={field.value}
                                                        onValueChange={(val) => {
                                                            const numVal = parseFloat(val?.replace(',', '.') || "0");
                                                            field.onChange(numVal);
                                                            form.setValue(`items.${index}.total` as any, calculateItemTotal(form.getValues(`items.${index}.quantity` as any), numVal, form.getValues(`items.${index}.discount` as any)) as any);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.discount`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tCon("discount")}</FormLabel>
                                                <FormControl>
                                                    <MoneyInput
                                                        value={field.value}
                                                        onValueChange={(val) => {
                                                            const numVal = parseFloat(val?.replace(',', '.') || "0");
                                                            field.onChange(numVal);
                                                            form.setValue(`items.${index}.total` as any, calculateItemTotal(form.getValues(`items.${index}.quantity` as any), form.getValues(`items.${index}.unitPrice` as any), numVal) as any);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex flex-col justify-end pb-2">
                                        <div className="text-right pr-4 font-semibold">
                                            {tCon("total")}: R$ {(Number(form.watch(`items.${index}.total` as any)) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-4">
                                                <Input placeholder={tCon("descriptionPlaceholder")} {...field} value={field.value || ""} />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                        
                        <Separator />
                        <div className="flex justify-end p-4">
                            <div className="text-xl font-bold">
                                {tCon("totalValue")}: R$ {overallTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Faturamento e Prazos */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {tCon("form.billingInfo")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("startDate")}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("endDate")} ({tCon("optional")})</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="billingDay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("billingDay")}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            min={1} 
                                            max={31} 
                                            {...field} 
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                        />
                                    </FormControl>
                                    <FormDescription>{tCon("billingDayDescription")}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="paymentCondition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{tCon("paymentCondition")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 30 dias" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>{tCon("notes")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={tCon("notesPlaceholder")} {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

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
