-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "cutoffTime" TEXT DEFAULT '22:00',
ADD COLUMN     "enableCutoffTime" BOOLEAN NOT NULL DEFAULT false;
