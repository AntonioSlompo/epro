"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { createVehicle, updateVehicle, deleteVehicle } from "@/actions/vehicle-actions";
import { vehicleSchema, type VehicleFormValues } from "@/schemas/vehicle-schema";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, FileText, Settings, Fuel, Gauge } from "lucide-react";

interface VehicleFormProps {
    initialData?: any;
}

export function VehicleForm({ initialData }: VehicleFormProps) {
    const t = useTranslations("Common");
    const tVehicles = useTranslations("Vehicles.form");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isEditing = !!initialData;

    const form = useForm<z.input<typeof vehicleSchema>>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: initialData || {
            plate: "",
            brand: "",
            model: "",
            yearManufacture: null,
            yearModel: null,
            color: "",
            renavam: "",
            chassis: "",
            fleetNumber: "",
            type: "CAR",
            status: "AVAILABLE" as any,
            fuelType: null,
            currentMileage: null,
        },
    });

    async function onSubmit(data: z.input<typeof vehicleSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateVehicle.bind(null, initialData.id, data) : createVehicle.bind(null, data);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tVehicles("updateSuccess") : tVehicles("createSuccess"));
                router.push("/vehicles");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* 1. Identificação Principal */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-primary" />
                            Identificação Principal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="plate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placa *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABC-1234 ou ABC1D23" {...field} className="uppercase" />
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
                                        <FormLabel>Tipo de Veículo *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CAR">Carro</SelectItem>
                                                    <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                                                    <SelectItem value="TRUCK">Caminhão</SelectItem>
                                                    <SelectItem value="VAN">Van/Utilitário</SelectItem>
                                                    <SelectItem value="OTHER">Outro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Fiat, Chevrolet, Honda" {...field} />
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
                                        <FormLabel>Modelo *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Uno, S10, CG 160" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearManufacture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano Fabricação</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1900} placeholder="Ex: 2020" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearModel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano Modelo</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1900} placeholder="Ex: 2021" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Branco, Prata" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Classificação e Status */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Classificação e Condição
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="AVAILABLE">Disponível</SelectItem>
                                                    <SelectItem value="IN_USE">Em Uso</SelectItem>
                                                    <SelectItem value="MAINTENANCE">Em Manutenção</SelectItem>
                                                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fuelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Fuel className="w-4 h-4"/> Combustível</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o combustível" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GASOLINE">Gasolina</SelectItem>
                                                    <SelectItem value="ALCOHOL">Álcool</SelectItem>
                                                    <SelectItem value="FLEX">Flex</SelectItem>
                                                    <SelectItem value="DIESEL">Diesel</SelectItem>
                                                    <SelectItem value="ELECTRIC">Elétrico</SelectItem>
                                                    <SelectItem value="GNV">GNV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentMileage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Gauge className="w-4 h-4"/> Quilometragem Atual (km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} placeholder="Ex: 50000" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Documentação e Controle */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Documentação e Controle Interno
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="renavam"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Renavam</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Código Renavam" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chassis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chassi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Número do Chassi" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fleetNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número da Frota / Prefixo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: FR-001" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>


                <div className="flex justify-end items-center pt-4">
                    <div>
                        <Button type="button" variant="outline" className="mr-4" onClick={() => router.push("/vehicles")}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t("saving") : t("save")}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
