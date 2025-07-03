/*
  Warnings:

  - You are about to drop the column `clientName` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `clientAddress` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientBirthDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientCity` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientCountry` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientFirstName` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientIdNumber` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientLastName` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientPhone` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientPostalCode` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "clientName",
DROP COLUMN "phone",
ADD COLUMN     "clientAddress" TEXT NOT NULL,
ADD COLUMN     "clientBirthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "clientCity" TEXT NOT NULL,
ADD COLUMN     "clientCountry" TEXT NOT NULL,
ADD COLUMN     "clientFirstName" TEXT NOT NULL,
ADD COLUMN     "clientIdNumber" TEXT NOT NULL,
ADD COLUMN     "clientLastName" TEXT NOT NULL,
ADD COLUMN     "clientPhone" TEXT NOT NULL,
ADD COLUMN     "clientPostalCode" TEXT NOT NULL;
