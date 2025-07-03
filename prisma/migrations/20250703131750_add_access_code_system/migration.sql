-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "accessCodeType" TEXT NOT NULL DEFAULT 'room',
ADD COLUMN     "accessInstructions" TEXT,
ADD COLUMN     "generalAccessCode" TEXT;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "accessCode" TEXT;
