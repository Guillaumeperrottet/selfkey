/*
  Warnings:

  - You are about to drop the `daily_inventory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "daily_inventory" DROP CONSTRAINT "daily_inventory_hotelSlug_fkey";

-- DropForeignKey
ALTER TABLE "daily_inventory" DROP CONSTRAINT "daily_inventory_roomId_fkey";

-- DropTable
DROP TABLE "daily_inventory";
