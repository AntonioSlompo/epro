'use client';

import { useState, useTransition, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useDebounce } from 'use-debounce';
import { fetchAddressByCep, fetchCoordinatesByAddress } from '@/actions/address-actions';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';

const LocationMap = dynamic(() => import('./location-map'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">Carregando mapa...</div>
});

const MASKS = {
    pt: (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);
    },
    default: (value: string) => value
};

export function AddressForm() {
    const { control, setValue, watch, trigger } = useFormContext();
    const locale = useLocale();
    const t = useTranslations("AddressComponent");

    const number = watch('number');
    const street = watch('street');
    const city = watch('city');
    const state = watch('state'); // UF

    // Create a composite address string for geocoding
    const fullAddress = `${street || ''}, ${number || ''}, ${city || ''}, ${state || ''}, Brazil`;
    const [debouncedAddress] = useDebounce(fullAddress, 1000);

    // Effect to update coordinates when address changes manually
    useEffect(() => {
        // Only fetch if we have at least street and city, and it wasn't a CEP fetch (checked via flag or just let it update)
        // To avoid race conditions with CEP fetch, we could check if fields are dirty or just rely on the API.
        if (!debouncedAddress || debouncedAddress.length < 10) return;
        if (!street || !city) return;

        async function updateCoordinates() {
            const coords = await fetchCoordinatesByAddress(debouncedAddress);
            if (coords) {
                setValue('latitude', coords.latitude);
                setValue('longitude', coords.longitude);
            }
        }
        updateCoordinates();
    }, [debouncedAddress, setValue, street, city]);

    // We can use t('address') if it exists, for now hardcoding labels/placeholders based on typical usage or creating generic ones
    // Integrating specific logic for masking
    const [isLoadingAddress, startTransition] = useTransition();

    const zip = watch('zip');
    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const address = watch('street'); // visual check

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (locale === 'pt') {
            value = MASKS.pt(value);
        }
        setValue('zip', value);

        // Auto search on complete CEP
        const cleanCep = value.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            handleSearchCep(value);
        }
    };

    const handleSearchCep = (cepValue?: string) => {
        const cepToSearch = cepValue || zip;
        if (!cepToSearch) return;

        startTransition(async () => {
            const result = await fetchAddressByCep(cepToSearch);
            if (result.success && result.data) {
                setValue('street', result.data.street);
                setValue('neighborhood', result.data.neighborhood);
                setValue('city', result.data.city);
                setValue('state', result.data.state);
                if (result.data.latitude && result.data.longitude) {
                    setValue('latitude', result.data.latitude);
                    setValue('longitude', result.data.longitude);
                }
                // Clear errors if any
                trigger(['street', 'neighborhood', 'city', 'state']);
            } else {
                // Could set an error on the zip field
                console.error(result.error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-12">
                <FormField
                    control={control}
                    name="zip"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-3">
                            <FormLabel>{t("zipLabel")}</FormLabel>
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input
                                        {...field}
                                        onChange={handleCepChange}
                                        placeholder={t("zipPlaceholder")}
                                        maxLength={locale === 'pt' ? 9 : 20}
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleSearchCep()}
                                    disabled={isLoadingAddress}
                                >
                                    {isLoadingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="street"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-9">
                            <FormLabel>{t("streetLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("streetPlaceholder")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="number"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
                            <FormLabel>{t("numberLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("numberPlaceholder")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="complement"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-3">
                            <FormLabel>{t("complementLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("complementPlaceholder")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="neighborhood"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-7">
                            <FormLabel>{t("neighborhoodLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("neighborhoodPlaceholder")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-10">
                            <FormLabel>{t("cityLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("cityPlaceholder")} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="state"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
                            <FormLabel>{t("stateLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder={t("statePlaceholder")} maxLength={2} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Hidden Coordinates Fields */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="latitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("latitudeLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ''} readOnly className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="longitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("longitudeLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ''} readOnly className="bg-muted/50" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Map Display */}
            <div className="mt-4 border rounded-md overflow-hidden h-[300px]">
                <LocationMap
                    latitude={latitude ? Number(latitude) : undefined}
                    longitude={longitude ? Number(longitude) : undefined}
                    popupText={address}
                    onPositionChange={(lat, lng) => {
                        setValue('latitude', lat);
                        setValue('longitude', lng);
                    }}
                />
            </div>
        </div>
    );
}
