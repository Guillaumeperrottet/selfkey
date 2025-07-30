-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "touristTaxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "touristTaxAmount" DOUBLE PRECISION NOT NULL DEFAULT 3.00,
ADD COLUMN     "touristTaxEnabled" BOOLEAN NOT NULL DEFAULT true;
