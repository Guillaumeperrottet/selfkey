-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "confirmationMethod" TEXT,
ADD COLUMN     "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmationSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "confirmationEmailEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "confirmationEmailFrom" TEXT,
ADD COLUMN     "confirmationEmailTemplate" TEXT,
ADD COLUMN     "confirmationWhatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmationWhatsappFrom" TEXT,
ADD COLUMN     "confirmationWhatsappTemplate" TEXT;
