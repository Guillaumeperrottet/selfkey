/*
  Warnings:

  - A unique constraint covering the columns `[bookingNumber]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingNumber` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/

-- Étape 1: Ajouter le champ comme optionnel d'abord
ALTER TABLE "bookings" ADD COLUMN "bookingNumber" INTEGER;

-- Étape 2: Créer une séquence qui commence à 100000
CREATE SEQUENCE booking_number_seq START 100000 INCREMENT 1;

-- Étape 3: Attribuer des numéros aux réservations existantes dans l'ordre de création
WITH numbered_bookings AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "bookingDate") + 99999 as new_number
  FROM "bookings"
  WHERE "bookingNumber" IS NULL
)
UPDATE "bookings" 
SET "bookingNumber" = numbered_bookings.new_number
FROM numbered_bookings 
WHERE "bookings".id = numbered_bookings.id;

-- Étape 4: Ajuster la séquence pour qu'elle continue après les numéros assignés
SELECT setval('booking_number_seq', (SELECT COALESCE(MAX("bookingNumber"), 99999) + 1 FROM "bookings"));

-- Étape 5: Rendre le champ obligatoire et unique
ALTER TABLE "bookings" ALTER COLUMN "bookingNumber" SET NOT NULL;

-- Étape 6: Créer l'index unique
CREATE UNIQUE INDEX "bookings_bookingNumber_key" ON "bookings"("bookingNumber");
