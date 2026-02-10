'use client';

import { AddressForm } from "@/components/common/address-form";
import { DocumentForm } from "@/components/common/document-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { addressSchema } from "@/schemas/address-schema";
import { documentSchema } from "@/schemas/document-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

// Combined schema for demo
const demoSchema = documentSchema.merge(addressSchema);

export default function DocumentDemoPage() {
    const t = useTranslations("DocumentDemo");
    const form = useForm({
        resolver: zodResolver(demoSchema),
        defaultValues: {
            // Document defaults
            documentType: 'CNPJ',
            document: '',
            legalName: '',
            tradeName: '',
            stateRegistration: '',
            // Address defaults
            zip: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            latitude: undefined,
            longitude: undefined
        }
    });

    function onSubmit(data: z.infer<typeof demoSchema>) {
        console.log("Form Submitted:", data);
        alert(JSON.stringify(data, null, 2));
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <Card className="max-w-4xl mx-auto border-none shadow-none bg-background/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Document Section */}
                            <div className="p-4 border rounded-lg bg-card/50">
                                <h2 className="mb-4 text-lg font-semibold">{t('businessDataSection')}</h2>
                                <DocumentForm />
                            </div>

                            {/* Address Section */}
                            <div className="p-4 border rounded-lg bg-card/50">
                                <h2 className="mb-4 text-lg font-semibold">{t('addressDataSection')}</h2>
                                <AddressForm />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                    {t('submitButton')}
                                </button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm overflow-auto">
                <pre>{JSON.stringify(form.watch(), null, 2)}</pre>
            </div>
        </div>
    );
}
