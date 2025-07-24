-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookingType" TEXT NOT NULL DEFAULT 'night',
ADD COLUMN     "dayParkingDuration" TEXT,
ADD COLUMN     "dayParkingEndTime" TIMESTAMP(3),
ADD COLUMN     "dayParkingStartTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "dayParkingTarif1h" DOUBLE PRECISION DEFAULT 5.00,
ADD COLUMN     "dayParkingTarif2h" DOUBLE PRECISION DEFAULT 8.00,
ADD COLUMN     "dayParkingTarif3h" DOUBLE PRECISION DEFAULT 12.00,
ADD COLUMN     "dayParkingTarif4h" DOUBLE PRECISION DEFAULT 15.00,
ADD COLUMN     "dayParkingTarifFullDay" DOUBLE PRECISION DEFAULT 35.00,
ADD COLUMN     "dayParkingTarifHalfDay" DOUBLE PRECISION DEFAULT 20.00,
ADD COLUMN     "enableDayParking" BOOLEAN NOT NULL DEFAULT false;
