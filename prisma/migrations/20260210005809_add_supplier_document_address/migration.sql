/*
  Warnings:

  - You are about to drop the column `address` on the `Supplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[document]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "address",
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "document" TEXT NOT NULL,
ADD COLUMN     "documentType" TEXT NOT NULL DEFAULT 'CNPJ',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "tradeName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_document_key" ON "Supplier"("document");
