-- Script SQL pour vérifier la configuration des emails en copie
-- Pour les réservations classiques (parking nuit)

-- 1. Vérifier quels établissements ont activé les emails en copie
SELECT 
  id,
  slug,
  name,
  "enableEmailCopyOnConfirmation",
  "emailCopyAddresses",
  "confirmationEmailEnabled"
FROM establishments
WHERE "enableEmailCopyOnConfirmation" = true
ORDER BY name;

-- 2. Vérifier la configuration pour un établissement spécifique
-- (Remplacer 'camping-du-lac' par le slug de votre établissement)
SELECT 
  id,
  slug,
  name,
  "enableEmailCopyOnConfirmation",
  "emailCopyAddresses",
  "confirmationEmailFrom",
  "confirmationEmailEnabled"
FROM establishments
WHERE slug = 'camping-du-lac';

-- 3. Voir les dernières réservations classiques et leur statut de confirmation
SELECT 
  b.id,
  b."bookingNumber",
  b."bookingType",
  b."clientEmail",
  b."confirmationSent",
  b."confirmationMethod",
  b."confirmationSentAt",
  e.name as establishment_name,
  e."enableEmailCopyOnConfirmation",
  e."emailCopyAddresses"
FROM bookings b
JOIN establishments e ON b."hotelSlug" = e.slug
WHERE b."bookingType" = 'classic_booking'
ORDER BY b."bookingDate" DESC
LIMIT 10;

-- 4. Activer les emails en copie pour un établissement
-- (Remplacer les valeurs selon vos besoins)
/*
UPDATE establishments
SET 
  "enableEmailCopyOnConfirmation" = true,
  "emailCopyAddresses" = ARRAY['admin@exemple.com', 'reception@exemple.com']
WHERE slug = 'camping-du-lac';
*/

-- 5. Vérifier les réservations qui devraient avoir reçu des copies mais n'ont pas confirmé
SELECT 
  b.id,
  b."bookingNumber",
  b."clientEmail",
  b."bookingDate",
  b."confirmationSent",
  e.name,
  e."emailCopyAddresses"
FROM bookings b
JOIN establishments e ON b."hotelSlug" = e.slug
WHERE 
  b."bookingType" = 'classic_booking'
  AND e."enableEmailCopyOnConfirmation" = true
  AND b."confirmationSent" = true
  AND b."bookingDate" >= NOW() - INTERVAL '7 days'
ORDER BY b."bookingDate" DESC;
