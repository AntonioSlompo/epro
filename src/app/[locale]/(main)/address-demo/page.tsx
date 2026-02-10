'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/common/address-form";
import { addressSchema, AddressFormValues } from "@/schemas/address-schema";

export default function AddressDemoPage() {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            zip: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            latitude: undefined,
            longitude: undefined,
        },
    });

    const onSubmit = (data: AddressFormValues) => {
        console.log("Form submitted:", data);
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Teste do Componente de Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <AddressForm />

                            <div className="flex justify-end">
                                <Button type="submit">
                                    Enviar Teste
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
