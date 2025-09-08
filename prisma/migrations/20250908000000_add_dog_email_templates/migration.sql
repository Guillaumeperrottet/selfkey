-- Add dog-specific email templates
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailTemplateWithDog" TEXT;
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailTemplateWithoutDog" TEXT;
