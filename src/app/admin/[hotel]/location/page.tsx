import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PresentationForm } from "@/components/ui/presentation-form";
import { headers } from "next/headers";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const establishment = await prisma.establishment.findFirst({
    where: {
      slug: hotel,
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
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
      mapTitle: true,
      mapTitle_en: true,
      mapTitle_de: true,
      mapDescription: true,
      mapDescription_en: true,
      mapDescription_de: true,
      mapImage: true,
      showOnMap: true,
      presentationImages: true,
      presentationDescription: true,
      presentationDescription_en: true,
      presentationDescription_de: true,
      presentationAttributes: true,
      presentationWebsite: true,
      presentationEmail: true,
      presentationPhone: true,
      presentationDocuments: true,
      presentationNearbyBusinesses: true,
      isPubliclyVisible: true,
      is24h7Access: true,
      checkInStartTime: true,
      checkInEndTime: true,
      checkOutTime: true,
      accessRestrictions: true,
      accessRestrictions_en: true,
      accessRestrictions_de: true,
      showLocalImpact: true,
      localImpactTitle: true,
      localImpactTitle_en: true,
      localImpactTitle_de: true,
      localImpactDescription: true,
      localImpactDescription_en: true,
      localImpactDescription_de: true,
      touristTaxImpactMessage: true,
      touristTaxImpactMessage_en: true,
      touristTaxImpactMessage_de: true,
    },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Présentation & Carte - {establishment.name}
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <PresentationForm
            establishmentId={establishment.slug}
            initialData={{
              address: establishment.address || "",
              address_en: establishment.address_en || "",
              address_de: establishment.address_de || "",
              city: establishment.city || "",
              city_en: establishment.city_en || "",
              city_de: establishment.city_de || "",
              postalCode: establishment.postalCode || "",
              country: establishment.country || "",
              latitude: establishment.latitude || undefined,
              longitude: establishment.longitude || undefined,
              mapTitle: establishment.mapTitle || "",
              mapTitle_en: establishment.mapTitle_en || "",
              mapTitle_de: establishment.mapTitle_de || "",
              mapDescription: establishment.mapDescription || "",
              mapDescription_en: establishment.mapDescription_en || "",
              mapDescription_de: establishment.mapDescription_de || "",
              mapImage: establishment.mapImage || "",
              showOnMap: establishment.showOnMap,
              presentationImages: establishment.presentationImages || [],
              presentationDescription:
                establishment.presentationDescription || "",
              presentationDescription_en:
                establishment.presentationDescription_en || "",
              presentationDescription_de:
                establishment.presentationDescription_de || "",
              presentationAttributes:
                (establishment.presentationAttributes as Record<
                  string,
                  boolean
                >) || {},
              presentationWebsite: establishment.presentationWebsite || "",
              presentationEmail: establishment.presentationEmail || "",
              presentationPhone: establishment.presentationPhone || "",
              presentationDocuments:
                (establishment.presentationDocuments as Array<{
                  name: string;
                  url: string;
                  type: string;
                  description?: string;
                }>) || [],
              presentationNearbyBusinesses:
                (establishment.presentationNearbyBusinesses as Array<{
                  name: string;
                  type: string;
                  distance: string;
                  description?: string;
                  website?: string;
                  mapsUrl?: string;
                  image?: string;
                  documents?: Array<{
                    name: string;
                    url: string;
                  }>;
                }>) || [],
              isPubliclyVisible: establishment.isPubliclyVisible,
              is24h7Access: establishment.is24h7Access,
              checkInStartTime: establishment.checkInStartTime || "",
              checkInEndTime: establishment.checkInEndTime || "",
              checkOutTime: establishment.checkOutTime || "",
              accessRestrictions: establishment.accessRestrictions || "",
              accessRestrictions_en: establishment.accessRestrictions_en || "",
              accessRestrictions_de: establishment.accessRestrictions_de || "",
              showLocalImpact: establishment.showLocalImpact,
              localImpactTitle: establishment.localImpactTitle || "",
              localImpactTitle_en: establishment.localImpactTitle_en || "",
              localImpactTitle_de: establishment.localImpactTitle_de || "",
              localImpactDescription:
                establishment.localImpactDescription || "",
              localImpactDescription_en:
                establishment.localImpactDescription_en || "",
              localImpactDescription_de:
                establishment.localImpactDescription_de || "",
              touristTaxImpactMessage:
                establishment.touristTaxImpactMessage || "",
              touristTaxImpactMessage_en:
                establishment.touristTaxImpactMessage_en || "",
              touristTaxImpactMessage_de:
                establishment.touristTaxImpactMessage_de || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
