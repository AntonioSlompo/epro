"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/product-actions";
import { productSchema, type ProductFormValues } from "@/schemas/product-schema";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Package, 
    Repeat, 
    Filter, 
    DollarSign, 
    FileText, 
    Settings, 
    Layers
} from "lucide-react";

interface ProductFormProps {
    initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const t = useTranslations("Common");
    const tProd = useTranslations("Products.form");
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const isEditing = !!initialData;

    const form = useForm<z.input<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: "",
            sku: "",
            type: "PHYSICAL",
            category: "EQUIPMENT",
            status: "ACTIVE",
            description: "",
            isRecurring: false,
            periodicity: null,
            billingType: null,
            autoAdjustIndex: null,
            autoAdjustBaseMonth: null,
            subscriptionPrice: null,
            setupFee: null,
            defaultContractPeriod: null,
            crmFunnelStage: null,
            requiresTechnicalInspection: false,
            inspectionChecklistId: null,
            leadScoreWeight: null,
            suggestedSellingPrice: null,
            averageCost: null,
            targetProfitMargin: null,
            salesCommission: null,
            recurringCommission: null,
            ncm: "",
            nfsCode: "",
            taxRuleType: "",
            brand: "",
            model: "",
            unitOfMeasure: null,
            minStock: null,
            maxStock: null,
            warehouseLocation: "",
            warrantyMonths: null,
            isBundle: false,
            bundleDiscount: null,
        },
    });

    const isRecurring = form.watch("isRecurring");
    const type = form.watch("type");
    const isPhysical = type === "PHYSICAL";

    async function onSubmit(data: z.input<typeof productSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateProduct.bind(null, initialData.id, data) : createProduct.bind(null, data);
            const result = await action();

            if (result.success) {
                toast.success(isEditing ? tProd("updateSuccess") : tProd("createSuccess"));
                router.push("/products");
            } else {
                toast.error(result.error || t("error"));
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* 1. Identificação Geral */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Identificação Geral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Nome do Produto/Serviço *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Câmera IP Dome 2MP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código/SKU *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: CAM-IP-001" {...field} />
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
                                        <FormLabel>Tipo *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PHYSICAL">Produto (Físico)</SelectItem>
                                                    <SelectItem value="SERVICE_ONETIME">Serviço (Avulso)</SelectItem>
                                                    <SelectItem value="SERVICE_RECURRING">Serviço (Recorrente/SaaS)</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        <FormLabel>Categoria *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a categoria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MONITORING">Monitoramento</SelectItem>
                                                    <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                                                    <SelectItem value="INSTALLATION">Instalação</SelectItem>
                                                    <SelectItem value="SOFTWARE_LICENSE">Licença de Software</SelectItem>
                                                    <SelectItem value="EQUIPMENT">Equipamento</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        <FormLabel>Status *</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                                                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                                                    <SelectItem value="DISCONTINUED">Descontinuado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Detalhada</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva as características do produto ou serviço..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 2. Configurações de Recorrência */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Repeat className="w-5 h-5 text-primary" />
                            Configurações de Recorrência
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="isRecurring"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">É Recorrente?</FormLabel>
                                        <FormDescription>Ative se este item gera cobranças contínuas (mensalidades, assinaturas).</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {isRecurring && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="periodicity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Periodicidade</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                                                        <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                                                        <SelectItem value="SEMIANNUALLY">Semestral</SelectItem>
                                                        <SelectItem value="ANNUALLY">Anual</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="billingType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Cobrança</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PREPAID">Pré-pago</SelectItem>
                                                        <SelectItem value="POSTPAID">Pós-pago</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subscriptionPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Valor da Assinatura/Mensalidade</FormLabel>
                                            <FormControl>
                                                <MoneyInput value={field.value || 0} onChange={(val) => field.onChange(val)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="setupFee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxa de Adesão/Setup</FormLabel>
                                            <FormControl>
                                                <MoneyInput value={field.value || 0} onChange={(val) => field.onChange(val)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="autoAdjustIndex"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Índice de Reajuste Automático</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Nenhum" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="IGPM">IGP-M</SelectItem>
                                                        <SelectItem value="IPCA">IPCA</SelectItem>
                                                        <SelectItem value="MANUAL">Outro / Manual</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="autoAdjustBaseMonth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mês Base de Reajuste (1-12)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} max={12} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="defaultContractPeriod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prazo Contratual Padrão (Meses)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Integração com CRM */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Integração com CRM e Funil de Vendas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="crmFunnelStage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Etapa Sugerida no Funil</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PROSPECTING">Prospecção</SelectItem>
                                                    <SelectItem value="QUALIFICATION">Qualificação</SelectItem>
                                                    <SelectItem value="PROPOSAL">Proposta</SelectItem>
                                                    <SelectItem value="INSPECTION">Vistoria</SelectItem>
                                                    <SelectItem value="NEGOTIATION">Negociação</SelectItem>
                                                    <SelectItem value="CLOSING">Fechamento</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="leadScoreWeight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pontuação/Peso no Lead</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="requiresTechnicalInspection"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Exige Vistoria Técnica?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* inspectionChecklistId skipped for now since checklist models are not defined */}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Venda e Custos */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-primary" />
                            Dados de Venda e Custos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="suggestedSellingPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preço de Venda Sugerido *</FormLabel>
                                    <FormControl>
                                        <MoneyInput value={field.value || 0} onChange={(val) => field.onChange(val)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="averageCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custo Médio / Custo de Aquisição</FormLabel>
                                    <FormControl>
                                        <MoneyInput value={field.value || 0} onChange={(val) => field.onChange(val)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="targetProfitMargin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Margem de Lucro Desejada (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="salesCommission"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comissão de Venda (Fixo ou %)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.1" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isRecurring && (
                            <FormField
                                control={form.control}
                                name="recurringCommission"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comissão de Recorrência (Fixo ou %)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* 5. Dados Fiscais */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Dados Fiscais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="ncm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NCM (Produtos)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0000.00.00" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nfsCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código de Serviço (NFS-e)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 14.01" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="taxRuleType"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Regra de Tributação</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Descreva a regra de exceção caso haja." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* 6. Informações Técnicas e de Estoque */}
                {isPhysical && (
                    <Card className="border-border/50 bg-card/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                Informações Técnicas e de Estoque
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca/Fabricante</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Intelbras" {...field} value={field.value || ''} />
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
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: VHD 3230" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitOfMeasure"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidade de Medida</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UN">Unidade</SelectItem>
                                                    <SelectItem value="MT">Metro</SelectItem>
                                                    <SelectItem value="KG">Quilo</SelectItem>
                                                    <SelectItem value="KIT">Kit</SelectItem>
                                                    <SelectItem value="HR">Hora</SelectItem>
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
                                name="warrantyMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Garantia (Meses)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minStock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estoque Mínimo</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxStock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estoque Máximo</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="warehouseLocation"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Localização no Almoxarifado</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Corredor A, Prateleira 3" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 7. Kits/Pacotes */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Composição de Kits/Pacotes (Bundles)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="isBundle"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">É um Kit/Pacote?</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
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
