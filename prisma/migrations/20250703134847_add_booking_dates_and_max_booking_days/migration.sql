/*
  Warnings:

  - Added the required column `checkInDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOutDate` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "checkInDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "checkOutDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "maxBookingDays" INTEGER NOT NULL DEFAULT 4;
