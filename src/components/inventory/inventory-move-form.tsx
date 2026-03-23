"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createInventoryMove } from "@/actions/inventory-actions";
import { InventoryTransactionType, TransactionDirection } from "@prisma/client";
import { Package, FileText, Info } from "lucide-react";
import { QuantityInput } from "@/components/ui/quantity-input";
import { MoneyInput } from "@/components/ui/money-input";

const moveSchema = z.object({
    productId: z.string().min(1, "Selecione o produto"),
    type: z.nativeEnum(InventoryTransactionType),
    direction: z.nativeEnum(TransactionDirection),
    quantity: z.coerce.number().positive("A quantidade deve ser positiva"),
    sourceLocationId: z.string().optional(),
    destinationLocationId: z.string().optional(),
    unitCost: z.coerce.number().optional(),
    document: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().optional(),
}).refine((data) => {
    if (data.type === InventoryTransactionType.TRANSFER) {
        return !!data.sourceLocationId && !!data.destinationLocationId;
    }
    if (data.direction === TransactionDirection.IN) {
        return !!data.destinationLocationId;
    }
    if (data.direction === TransactionDirection.OUT) {
        return !!data.sourceLocationId;
    }
    return true;
}, {
    message: "Local de origem/destino obrigatório conforme o tipo de movimentação",
    path: ["sourceLocationId"]
});

interface MoveFormProps {
    products: { label: string; value: string }[];
    locations: { label: string; value: string }[];
}

export function InventoryMoveForm({ products, locations }: MoveFormProps) {
    const t = useTranslations("Inventory");
    const router = useRouter();

    const form = useForm<any>({
        resolver: zodResolver(moveSchema) as any,
        defaultValues: {
            productId: "",
            type: InventoryTransactionType.PURCHASE,
            direction: TransactionDirection.IN,
            quantity: 1,
            sourceLocationId: "",
            destinationLocationId: "",
            unitCost: 0,
            document: "",
            notes: "",
            date: new Date().toISOString().split('T')[0],
        },
    });

    const watchType = form.watch("type");
    const watchDirection = form.watch("direction");

    async function onSubmit(values: any) {
        const result = await createInventoryMove({
            ...values,
            date: values.date ? new Date(values.date) : undefined
        });

        if (result.success) {
            toast.success(t("form.createSuccess"));
            router.push("/inventory");
        } else {
            toast.error(result.error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* 1. Informações Básicas */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            {t("form.basicInfo")}
                        </CardTitle>
                        <CardDescription>{t("descriptionMove")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="productId"
                            render={({ field }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>{t("product")} *</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={products}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={t("selectProduct")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("type")} *</FormLabel>
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            // Auto-set direction based on type
                                            if (val === InventoryTransactionType.PURCHASE || val === InventoryTransactionType.RETURN) {
                                                form.setValue('direction', TransactionDirection.IN);
                                            }
                                            if (val === InventoryTransactionType.SALE || val === InventoryTransactionType.CONSUMPTION) {
                                                form.setValue('direction', TransactionDirection.OUT);
                                            }
                                            if (val === InventoryTransactionType.TRANSFER) {
                                                form.setValue('direction', TransactionDirection.OUT);
                                            }
                                        }} 
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(InventoryTransactionType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {t(`types.${type}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="direction"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("direction")} *</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                        disabled={watchType === InventoryTransactionType.TRANSFER}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={TransactionDirection.IN}>{t("directions.IN")}</SelectItem>
                                            <SelectItem value={TransactionDirection.OUT}>{t("directions.OUT")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("quantity")} *</FormLabel>
                                    <FormControl>
                                        <QuantityInput 
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("date")} *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="date" 
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        { (watchDirection === TransactionDirection.OUT || watchType === InventoryTransactionType.TRANSFER) && (
                            <FormField
                                control={form.control}
                                name="sourceLocationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("sourceLocation")} *</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={locations}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={t("selectLocation")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        { (watchDirection === TransactionDirection.IN || watchType === InventoryTransactionType.TRANSFER) && (
                            <FormField
                                control={form.control}
                                name="destinationLocationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("destinationLocation")} *</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={locations}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={t("selectLocation")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* 2. Custos e Documentos */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {t("form.details")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="unitCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("unitCost")}</FormLabel>
                                    <FormControl>
                                        <MoneyInput 
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                        />
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
                                    <FormLabel>{t("document")}</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder={t("documentPlaceholder")} 
                                            {...field} 
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
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
                            {t("notes")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="col-span-full">
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            value={field.value ?? ''}
                                            className="min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pb-12">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        {t("form.cancel") || "Cancelar"}
                    </Button>
                    <Button type="submit">
                        {t("moveProduct")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
