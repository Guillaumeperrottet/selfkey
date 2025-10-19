import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ hotel: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { hotel } = await params;
    const establishmentSlug = hotel;
    const {
      address,
      address_en,
      address_de,
      city,
      city_en,
      city_de,
      postalCode,
      country,
      latitude,
      longitude,
      mapTitle,
      mapTitle_en,
      mapTitle_de,
      mapDescription,
      mapDescription_en,
      mapDescription_de,
      mapImage,
      showOnMap,
      presentationImages,
      presentationDescription,
      presentationDescription_en,
      presentationDescription_de,
      presentationAttributes,
      presentationWebsite,
      presentationEmail,
      presentationPhone,
      presentationDocuments,
      presentationNearbyBusinesses,
      isPubliclyVisible,
      is24h7Access,
      checkInStartTime,
      checkInEndTime,
      checkOutTime,
      accessRestrictions,
      accessRestrictions_en,
      accessRestrictions_de,
      showLocalImpact,
      localImpactTitle,
      localImpactTitle_en,
      localImpactTitle_de,
      localImpactDescription,
      localImpactDescription_en,
      localImpactDescription_de,
      touristTaxImpactMessage,
      touristTaxImpactMessage_en,
      touristTaxImpactMessage_de,
    } = await request.json();

    // Vérifier que l'utilisateur est propriétaire de l'établissement
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: establishmentSlug,
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour la localisation et les informations de présentation
    const updatedEstablishment = await prisma.establishment.update({
      where: { slug: establishmentSlug },
      data: {
        address,
        address_en,
        address_de,
        city,
        city_en,
        city_de,
        postalCode,
        country,
        latitude,
        longitude,
        mapTitle,
        mapTitle_en,
        mapTitle_de,
        mapDescription,
        mapDescription_en,
        mapDescription_de,
        mapImage,
        showOnMap,
        presentationImages,
        presentationDescription,
        presentationDescription_en,
        presentationDescription_de,
        presentationAttributes,
        presentationWebsite,
        presentationEmail,
        presentationPhone,
        presentationDocuments,
        presentationNearbyBusinesses,
        isPubliclyVisible,
        is24h7Access,
        checkInStartTime,
        checkInEndTime,
        checkOutTime,
        accessRestrictions,
        accessRestrictions_en,
        accessRestrictions_de,
        showLocalImpact,
        localImpactTitle,
        localImpactTitle_en,
        localImpactTitle_de,
        localImpactDescription,
        localImpactDescription_en,
        localImpactDescription_de,
        touristTaxImpactMessage,
        touristTaxImpactMessage_en,
        touristTaxImpactMessage_de,
      },
    });

    return NextResponse.json(updatedEstablishment);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la localisation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
