-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "pricingOptionsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "selectedPricingOptions" JSONB;

-- CreateTable
CREATE TABLE "pricing_options" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_option_values" (
    "id" TEXT NOT NULL,
    "pricingOptionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceModifier" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_option_values_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_option_values" ADD CONSTRAINT "pricing_option_values_pricingOptionId_fkey" FOREIGN KEY ("pricingOptionId") REFERENCES "pricing_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
