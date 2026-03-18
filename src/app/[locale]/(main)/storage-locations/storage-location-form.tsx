"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { storageLocationSchema, type StorageLocationFormValues } from "@/schemas/storage-location-schema";
import { upsertStorageLocation, searchVehicles } from "@/actions/storage-location-actions";
import { AddressForm } from "@/components/common/address-form";
import { Loader2, MapPin, Truck, Box, Package } from "lucide-react";
import { Vehicle } from "@prisma/client";

interface StorageLocationFormProps {
    initialData?: any;
}

export function StorageLocationForm({ initialData }: StorageLocationFormProps) {
    const t = useTranslations("Common");
    const tLoc = useTranslations("StorageLocations");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [searchingVehicles, setSearchingVehicles] = useState(false);
    const [vehicleSearch, setVehicleSearch] = useState("");
    const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false);

    const form = useForm<StorageLocationFormValues>({
        resolver: zodResolver(storageLocationSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            type: (initialData?.type as any) || "FIXED",
            status: (initialData?.status as any) || "ACTIVE",
            zip: initialData?.zip || "",
            street: initialData?.street || "",
            number: initialData?.number || "",
            complement: initialData?.complement || "",
            neighborhood: initialData?.neighborhood || "",
            city: initialData?.city || "",
            state: initialData?.state || "",
            vehicleId: initialData?.vehicleId || null,
        },
    });

    const locationType = form.watch("type");

    // Load available vehicles if type is MOBILE
    useEffect(() => {
        if (locationType === "MOBILE") {
            const fetchInitialVehicles = async () => {
                setSearchingVehicles(true);
                const results = await searchVehicles("");
                // If editing and has a vehicle, include it in the list if not present
                if (initialData?.vehicle) {
                    const hasCurrent = results.some(v => v.id === initialData.vehicle.id);
                    if (!hasCurrent) {
                        results.push(initialData.vehicle);
                    }
                }
                setVehicles(results);
                setSearchingVehicles(false);
            };
            fetchInitialVehicles();
        }
    }, [locationType, initialData]);

    // Handle vehicle search
    useEffect(() => {
        if (locationType !== "MOBILE" || !vehicleSearch) return;

        const delayDebounceFn = setTimeout(async () => {
            setSearchingVehicles(true);
            const results = await searchVehicles(vehicleSearch);
             if (initialData?.vehicle && initialData.vehicle.plate.toLowerCase().includes(vehicleSearch.toLowerCase())) {
                 const hasCurrent = results.some(v => v.id === initialData.vehicle.id);
                 if (!hasCurrent) results.push(initialData.vehicle);
             }
            setVehicles(results);
            setSearchingVehicles(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [vehicleSearch, locationType, initialData]);

    async function onSubmit(data: StorageLocationFormValues) {
        setLoading(true);
        try {
            const result = await upsertStorageLocation({ ...data, id: initialData?.id });
            if (result.success) {
                toast.success(initialData ? tLoc("form.updateSuccess") : tLoc("form.createSuccess"));
                router.push("/storage-locations");
                router.refresh();
            } else {
                toast.error(result.error || t("error"));
            }
        } catch (error) {
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-6">
                    {/* Main Info Card */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    {tLoc("form.basicInfo")}
                                </CardTitle>
                                <CardDescription>Identificação e tipo do local</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>{t("name")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Galpão Central" {...field} />
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
                                            <FormLabel>{tLoc("form.locationType")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="FIXED">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            {tLoc("form.fixed")}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="MOBILE">
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-4 w-4" />
                                                            {tLoc("form.mobile")}
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="VIRTUAL">
                                                        <div className="flex items-center gap-2">
                                                            <Box className="h-4 w-4" />
                                                            {tLoc("form.virtual")}
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tLoc("form.status")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">{tLoc("form.active")}</SelectItem>
                                                    <SelectItem value="INACTIVE">{tLoc("form.inactive")}</SelectItem>
                                                    <SelectItem value="BLOCKED_MOVEMENT">{tLoc("form.blocked")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conditional Info Card */}
                    <div className="space-y-6">
                        {locationType === "FIXED" && (
                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <CardTitle>{tLoc("form.address")}</CardTitle>
                                    </div>
                                    <CardDescription>Localização física do estoque</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AddressForm />
                                </CardContent>
                            </Card>
                        )}

                        {locationType === "MOBILE" && (
                            <Card className="border-border/50 bg-card/40 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary" />
                                        <CardTitle>{tLoc("form.address")}</CardTitle>
                                    </div>
                                    <CardDescription>Selecione o veículo correspondente a este local</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="vehicleId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tLoc("form.vehicle")}</FormLabel>
                                                <Select 
                                                    onValueChange={field.onChange} 
                                                    defaultValue={field.value || undefined}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={tLoc("form.selectVehicle")} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {vehicles.map((v) => (
                                                            <SelectItem key={v.id} value={v.id}>
                                                                {v.plate} - {v.brand} {v.model}
                                                            </SelectItem>
                                                        ))}
                                                        {vehicles.length === 0 && !searchingVehicles && (
                                                            <SelectItem value="none" disabled>Nenhum veículo disponível</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {locationType === "VIRTUAL" && (
                            <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 animate-in fade-in duration-500">
                                <div className="text-center space-y-2">
                                    <Box className="h-12 w-12 text-muted-foreground mx-auto" />
                                    <p className="text-muted-foreground">Este é um local virtual. Não requer endereço ou veículo.</p>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-8 mt-6 border-t border-border/40">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/storage-locations")}
                        disabled={loading}
                    >
                        {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-32">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("saving")}
                            </>
                        ) : (
                            t("save")
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
