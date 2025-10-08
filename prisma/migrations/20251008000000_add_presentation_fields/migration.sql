-- AlterTable - Ajouter les nouveaux champs de présentation à la table establishments
ALTER TABLE "establishments" ADD COLUMN IF NOT EXISTS "presentationImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "presentationDescription" TEXT,
ADD COLUMN IF NOT EXISTS "presentationAttributes" JSONB,
ADD COLUMN IF NOT EXISTS "presentationWebsite" TEXT,
ADD COLUMN IF NOT EXISTS "presentationEmail" TEXT,
ADD COLUMN IF NOT EXISTS "presentationPhone" TEXT,
ADD COLUMN IF NOT EXISTS "presentationDocuments" JSONB,
ADD COLUMN IF NOT EXISTS "presentationNearbyBusinesses" JSONB,
ADD COLUMN IF NOT EXISTS "isPubliclyVisible" BOOLEAN NOT NULL DEFAULT false;
