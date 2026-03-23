import { z } from "zod";
import {
  ProductType,
  ProductCategory,
  ProductStatus,
  Periodicity,
  BillingType,
  AutoAdjustIndex,
  FunnelStage,
  UnitOfMeasure,
} from "@prisma/client";

export const productSchema = z.object({
  // 1. Identificação Geral
  name: z.string().min(1, "O nome é obrigatório"),
  sku: z.string().min(1, "O Código/SKU é obrigatório"),
  type: z.nativeEnum(ProductType, { error: "O tipo é obrigatório" }),
  category: z.nativeEnum(ProductCategory, { error: "A categoria é obrigatória" }),
  status: z.nativeEnum(ProductStatus).default("ACTIVE"),
  description: z.string().optional().nullable(),
  image1Url: z.string().optional().nullable(),
  image2Url: z.string().optional().nullable(),
  image3Url: z.string().optional().nullable(),
  
  // Base64 helper fields for image uploads
  image1Base64: z.string().optional(),
  image2Base64: z.string().optional(),
  image3Base64: z.string().optional(),

  // 2. Configurações de Recorrência
  isRecurring: z.boolean().default(false),
  periodicity: z.nativeEnum(Periodicity).optional().nullable(),
  billingType: z.nativeEnum(BillingType).optional().nullable(),
  autoAdjustIndex: z.nativeEnum(AutoAdjustIndex).optional().nullable(),
  autoAdjustBaseMonth: z.number().min(1).max(12).optional().nullable(),
  subscriptionPrice: z.number().optional().nullable(),
  setupFee: z.number().optional().nullable(),
  defaultContractPeriod: z.number().optional().nullable(),

  // 3. Integração com CRM
  crmFunnelStage: z.nativeEnum(FunnelStage).optional().nullable(),
  requiresTechnicalInspection: z.boolean().default(false),
  inspectionChecklistId: z.string().optional().nullable(),
  leadScoreWeight: z.number().optional().nullable(),

  // 4. Venda e Custos
  suggestedSellingPrice: z.number().min(0, "O preço deve ser maior que zero").optional().nullable(),
  averageCost: z.number().optional().nullable(),
  targetProfitMargin: z.number().optional().nullable(),
  salesCommission: z.number().optional().nullable(),
  recurringCommission: z.number().optional().nullable(),

  // 5. Dados Fiscais
  ncm: z.string().optional().nullable(),
  nfsCode: z.string().optional().nullable(),
  taxRuleType: z.string().optional().nullable(),
  // For JSON field, we can represent it as string initially or an object
  taxes: z.record(z.string(), z.any()).optional().nullable(),

  // 6. Informações Técnicas e de Estoque
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  unitOfMeasure: z.nativeEnum(UnitOfMeasure).optional().nullable(),
  minStock: z.number().optional().nullable(),
  maxStock: z.number().optional().nullable(),
  warehouseLocation: z.string().optional().nullable(),
  warrantyMonths: z.number().optional().nullable(),

  // 7. Kits/Pacotes
  isBundle: z.boolean().default(false),
  bundleDiscount: z.number().optional().nullable(),
  bundleItems: z.array(z.any()).optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
