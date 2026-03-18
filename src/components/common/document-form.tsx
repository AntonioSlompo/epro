'use client';

import { useFormContext } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Search } from 'lucide-react';
import { formatCEP, formatCNPJ, formatCPF } from '@/lib/validators';
import { fetchCompanyByCnpj } from '@/actions/company-actions';

// ... imports

interface DocumentFormProps {
    onAddressUpdate?: (address: unknown) => void;
    legalNameField?: string;
    tradeNameField?: string;
    documentField?: string;
    stateRegistrationField?: string;
    allowedDocumentTypes?: ('CNPJ' | 'CPF')[];
    onLegalNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentForm({
    legalNameField = 'legalName',
    tradeNameField = 'tradeName',
    documentField = 'document',
    stateRegistrationField = 'stateRegistration',
    allowedDocumentTypes = ['CNPJ', 'CPF'],
    onLegalNameChange
}: DocumentFormProps) {
    const { control, setValue, watch } = useFormContext<any>();
    const t = useTranslations("DocumentComponent");
    const [isLoading, startTransition] = useTransition();

    const documentType = watch('documentType') || 'CNPJ';
    const document = watch(documentField);

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        if (documentType === 'CPF') {
            if (value.length > 11) value = value.slice(0, 11);
            setValue(documentField, formatCPF(value));
        } else {
            if (value.length > 14) value = value.slice(0, 14);
            setValue(documentField, formatCNPJ(value));
        }
    };

    const handleSearch = () => {
        const docValue = document;
        const cleanDoc = docValue?.replace(/\D/g, '');

        if (documentType === 'CNPJ' && cleanDoc?.length === 14) {
            startTransition(async () => {
                const result = await fetchCompanyByCnpj(cleanDoc);

                if (result.success && result.data) {
                    setValue(legalNameField, result.data.name);
                    setValue(tradeNameField, result.data.tradeName);

                    // Populate Address
                    if (result.data) {
                        if (result.data.zip) setValue('zip', formatCEP(result.data.zip));
                        if (result.data.street) setValue('street', result.data.street);
                        if (result.data.number) setValue('number', result.data.number);
                        if (result.data.complement) setValue('complement', result.data.complement);
                        if (result.data.neighborhood) setValue('neighborhood', result.data.neighborhood);
                        if (result.data.city) setValue('city', result.data.city);
                        if (result.data.state) setValue('state', result.data.state);
                    }
                } else {
                    console.error(result.error);
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-12">
                <FormField
                    control={control}
                    name="documentType"
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-3 space-y-3">
                            <FormLabel>{t('documentTypeLabel')}</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    setValue(documentField, ''); // Clear document on type switch
                                }}
                                defaultValue={field.value}
                                disabled={allowedDocumentTypes.length <= 1}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('documentTypeLabel')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {allowedDocumentTypes.includes('CNPJ') && <SelectItem value="CNPJ">CNPJ</SelectItem>}
                                    {allowedDocumentTypes.includes('CPF') && <SelectItem value="CPF">CPF</SelectItem>}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={documentField}
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-5">
                            <FormLabel>{t('documentLabel')}</FormLabel>
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value || ""}
                                        onChange={handleDocumentChange}
                                        placeholder={documentType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSearch}
                                    disabled={isLoading || documentType === 'CPF'}
                                    title={documentType === 'CPF' ? t('cpfSearchDisabled') : t('searchCnpj')}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={stateRegistrationField}
                    render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-4">
                            <FormLabel>{t('stateRegistrationLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ""} placeholder={t('stateRegistrationPlaceholder')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <FormField
                    control={control}
                    name={legalNameField}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('legalNameLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ""} placeholder={t('legalNamePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={tradeNameField}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('tradeNameLabel')}</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value || ""} placeholder={t('tradeNamePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
