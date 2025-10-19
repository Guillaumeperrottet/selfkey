import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalizedField, type SupportedLocale } from "@/lib/i18n-helpers";

export async function GET(request: NextRequest) {
  try {
    // Get locale from query params, default to 'fr'
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "fr") as SupportedLocale;

    // Récupérer tous les établissements qui ont autorisé l'affichage sur la carte
    // et qui ont des coordonnées GPS valides
    const establishments = await prisma.establishment.findMany({
      where: {
        showOnMap: true,
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        name_en: true,
        name_de: true,
        mapTitle: true,
        mapTitle_en: true,
        mapTitle_de: true,
        mapDescription: true,
        mapDescription_en: true,
        mapDescription_de: true,
        mapImage: true,
        address: true,
        address_en: true,
        address_de: true,
        city: true,
        city_en: true,
        city_de: true,
        postalCode: true,
        country: true,
        latitude: true,
        longitude: true,
        isPubliclyVisible: true,
      },
    });

    // Formatter les données pour le composant map
    const formattedEstablishments = establishments.map((establishment) => {
      // Localize fields
      const localizedName = getLocalizedField(establishment, "name", locale);
      const localizedMapTitle = getLocalizedField(
        establishment,
        "mapTitle",
        locale
      );
      const localizedMapDescription = getLocalizedField(
        establishment,
        "mapDescription",
        locale
      );
      const localizedAddress = getLocalizedField(
        establishment,
        "address",
        locale
      );
      const localizedCity = getLocalizedField(establishment, "city", locale);

      return {
        id: establishment.id,
        name: localizedMapTitle || localizedName,
        description:
          localizedMapDescription ||
          `${localizedAddress ? localizedAddress + ", " : ""}${localizedCity || ""}`,
        location: `${localizedCity || ""}, ${establishment.country || "Switzerland"}`,
        latitude: establishment.latitude!,
        longitude: establishment.longitude!,
        type: "camping", // ou autre type selon votre logique
        price: "", // Vous pouvez ajouter la logique de prix si nécessaire
        image: establishment.mapImage,
        slug: establishment.slug,
        isPubliclyVisible: establishment.isPubliclyVisible,
      };
    });

    return NextResponse.json({
      success: true,
      establishments: formattedEstablishments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des établissements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des établissements",
      },
      { status: 500 }
    );
  }
}
