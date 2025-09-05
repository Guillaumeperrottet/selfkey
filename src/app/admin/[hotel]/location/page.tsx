import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LocationForm } from "@/components/ui/location-form";
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Localisation de {establishment.name}
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <LocationForm
            establishmentId={establishment.slug}
            initialData={{
              address: establishment.address || "",
              city: establishment.city || "",
              postalCode: establishment.postalCode || "",
              country: establishment.country || "",
              latitude: establishment.latitude || undefined,
              longitude: establishment.longitude || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
