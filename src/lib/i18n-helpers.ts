/**
 * Helper functions for i18n field localization
 */

export type SupportedLocale = "fr" | "en" | "de";

/**
 * Get a localized field from an object, with fallback to French
 * @param data - The data object containing the fields
 * @param field - The base field name (e.g., 'name', 'description')
 * @param locale - The desired locale ('fr', 'en', 'de')
 * @returns The localized value or the French value as fallback
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  data: T | null | undefined,
  field: keyof T,
  locale: SupportedLocale
): string | null | undefined {
  if (!data) return null;

  // If French, return the base field
  if (locale === "fr") {
    return data[field] as string | null | undefined;
  }

  // Try to get localized field (e.g., 'name_en', 'description_de')
  const localizedField = `${String(field)}_${locale}` as keyof T;
  const localizedValue = data[localizedField];

  // Return localized value if it exists, otherwise fallback to French
  return (
    (localizedValue as string | null | undefined) ||
    (data[field] as string | null | undefined)
  );
}

/**
 * Get multiple localized fields at once
 * @param data - The data object
 * @param fields - Array of field names to localize
 * @param locale - The desired locale
 * @returns Object with localized values
 */
export function getLocalizedFields<T extends Record<string, unknown>>(
  data: T | null | undefined,
  fields: (keyof T)[],
  locale: SupportedLocale
): Partial<T> {
  if (!data) return {};

  const result: Record<string, unknown> = {};

  for (const field of fields) {
    result[String(field)] = getLocalizedField(data, field, locale);
  }

  return result as Partial<T>;
}

/**
 * Localize an entire establishment object
 */
export function localizeEstablishment(
  establishment: Record<string, unknown> | null | undefined,
  locale: SupportedLocale
) {
  if (!establishment) return null;

  return {
    ...establishment,
    name: getLocalizedField(establishment, "name", locale),
    mapTitle: getLocalizedField(establishment, "mapTitle", locale),
    mapDescription: getLocalizedField(establishment, "mapDescription", locale),
    address: getLocalizedField(establishment, "address", locale),
    city: getLocalizedField(establishment, "city", locale),
    presentationDescription: getLocalizedField(
      establishment,
      "presentationDescription",
      locale
    ),
    accessRestrictions: getLocalizedField(
      establishment,
      "accessRestrictions",
      locale
    ),
    localImpactTitle: getLocalizedField(
      establishment,
      "localImpactTitle",
      locale
    ),
    localImpactDescription: getLocalizedField(
      establishment,
      "localImpactDescription",
      locale
    ),
    touristTaxImpactMessage: getLocalizedField(
      establishment,
      "touristTaxImpactMessage",
      locale
    ),
  };
}

/**
 * Localize nearby businesses array
 */
export function localizeNearbyBusinesses(
  businesses: Record<string, unknown>[] | undefined,
  locale: SupportedLocale
) {
  if (!businesses) return [];

  return businesses.map((business) => ({
    ...business,
    name: getLocalizedField(business, "name", locale),
    type: getLocalizedField(business, "type", locale),
    description: getLocalizedField(business, "description", locale),
  }));
}

/**
 * Localize documents array
 */
export function localizeDocuments(
  documents: Record<string, unknown>[] | undefined,
  locale: SupportedLocale
) {
  if (!documents) return [];

  return documents.map((doc) => ({
    ...doc,
    name: getLocalizedField(doc, "name", locale),
    description: getLocalizedField(doc, "description", locale),
  }));
}
