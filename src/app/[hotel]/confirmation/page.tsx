import { ConfirmationChoice } from "@/components/confirmation/ConfirmationChoice";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Props {
  params: Promise<{ hotel: string }>;
  searchParams: Promise<{ booking?: string }>;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: Props) {
  const { hotel } = await params;
  const { booking } = await searchParams;

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-semibold mb-2">
              Réservation introuvable
            </h3>
            <p className="text-sm text-gray-600">
              Impossible de trouver les détails de votre réservation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600">
            Votre réservation a été confirmée avec succès.
          </p>
        </div>

        <ConfirmationChoice bookingId={booking} hotelSlug={hotel} />
      </div>
    </div>
  );
}
