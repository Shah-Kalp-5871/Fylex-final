/*
  Warnings:

  - The `config` column on the `shipping_methods` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "_TaxClassToTaxRate" ADD CONSTRAINT "_TaxClassToTaxRate_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TaxClassToTaxRate_AB_unique";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "folder_path" TEXT DEFAULT '/';

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "is_sold_configuration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "tracking_url" TEXT;

-- AlterTable
ALTER TABLE "shipping_methods" DROP COLUMN "config",
ADD COLUMN     "config" JSONB;

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_care_steps" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "step_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_care_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_care_steps_product_id_idx" ON "product_care_steps"("product_id");

-- AddForeignKey
ALTER TABLE "product_care_steps" ADD CONSTRAINT "product_care_steps_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
