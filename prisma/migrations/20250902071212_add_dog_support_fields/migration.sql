-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "hasDog" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "enableDogOption" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "allowDogs" BOOLEAN NOT NULL DEFAULT false;
