-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'SERVICE_ONETIME', 'SERVICE_RECURRING');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('MONITORING', 'MAINTENANCE', 'INSTALLATION', 'SOFTWARE_LICENSE', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "Periodicity" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('PREPAID', 'POSTPAID');

-- CreateEnum
CREATE TYPE "AutoAdjustIndex" AS ENUM ('IGPM', 'IPCA', 'MANUAL');

-- CreateEnum
CREATE TYPE "FunnelStage" AS ENUM ('PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'INSPECTION', 'NEGOTIATION', 'CLOSING');

-- CreateEnum
CREATE TYPE "UnitOfMeasure" AS ENUM ('UN', 'MT', 'KG', 'KIT', 'HR', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE', 'TRUCK', 'VAN', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'ALCOHOL', 'FLEX', 'DIESEL', 'ELECTRIC', 'GNV');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "StorageLocationType" AS ENUM ('FIXED', 'MOBILE', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "StorageLocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED_MOVEMENT');

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "department" TEXT,
    "specialties" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "image3Url" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "periodicity" "Periodicity",
    "billingType" "BillingType",
    "autoAdjustIndex" "AutoAdjustIndex",
    "autoAdjustBaseMonth" INTEGER,
    "subscriptionPrice" DECIMAL(65,30),
    "setupFee" DECIMAL(65,30),
    "defaultContractPeriod" INTEGER,
    "crmFunnelStage" "FunnelStage",
    "requiresTechnicalInspection" BOOLEAN NOT NULL DEFAULT false,
    "inspectionChecklistId" TEXT,
    "leadScoreWeight" DOUBLE PRECISION,
    "suggestedSellingPrice" DECIMAL(65,30),
    "averageCost" DECIMAL(65,30),
    "targetProfitMargin" DOUBLE PRECISION,
    "salesCommission" DECIMAL(65,30),
    "recurringCommission" DECIMAL(65,30),
    "ncm" TEXT,
    "nfsCode" TEXT,
    "taxes" JSONB,
    "taxRuleType" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "unitOfMeasure" "UnitOfMeasure",
    "minStock" INTEGER,
    "maxStock" INTEGER,
    "warehouseLocation" TEXT,
    "warrantyMonths" INTEGER,
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "bundleItems" JSONB,
    "bundleDiscount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearManufacture" INTEGER,
    "yearModel" INTEGER,
    "color" TEXT,
    "renavam" TEXT,
    "chassis" TEXT,
    "fleetNumber" TEXT,
    "type" "VehicleType" NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "fuelType" "FuelType",
    "currentMileage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "category" TEXT,
    "status" "ToolStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StorageLocationType" NOT NULL,
    "status" "StorageLocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "zip" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userId_key" ON "Technician"("userId");

-- CreateIndex
CREATE INDEX "Technician_companyId_idx" ON "Technician"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_companyId_sku_key" ON "Product"("companyId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_companyId_plate_key" ON "Vehicle"("companyId", "plate");

-- CreateIndex
CREATE INDEX "Tool_companyId_idx" ON "Tool"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_vehicleId_key" ON "StorageLocation"("vehicleId");

-- CreateIndex
CREATE INDEX "StorageLocation_companyId_idx" ON "StorageLocation"("companyId");

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
