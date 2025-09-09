-- Add Unlayer design JSON fields for email templates
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailDesign" JSONB;
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailDesignWithDog" JSONB;
ALTER TABLE "establishments" ADD COLUMN "confirmationEmailDesignWithoutDog" JSONB;
