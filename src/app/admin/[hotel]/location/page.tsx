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
              city: establishment.city || "",
              postalCode: establishment.postalCode || "",
              country: establishment.country || "",
              latitude: establishment.latitude || undefined,
              longitude: establishment.longitude || undefined,
              mapTitle: establishment.mapTitle || "",
              mapDescription: establishment.mapDescription || "",
              mapImage: establishment.mapImage || "",
              showOnMap: establishment.showOnMap,
              presentationImages: establishment.presentationImages || [],
              presentationDescription:
                establishment.presentationDescription || "",
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
              showLocalImpact: establishment.showLocalImpact,
              localImpactTitle: establishment.localImpactTitle || "",
              localImpactDescription:
                establishment.localImpactDescription || "",
              touristTaxImpactMessage:
                establishment.touristTaxImpactMessage || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
