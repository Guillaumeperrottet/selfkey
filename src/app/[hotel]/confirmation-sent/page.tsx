import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ hotel: string }>;
}

export default async function ConfirmationSentPage({ params }: Props) {
  const { hotel } = await params;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Confirmation envoyée !
          </h1>
          <p className="text-gray-600 mb-6">
            Vous allez recevoir vos informations de réservation et codes
            d&apos;accès dans quelques instants.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vérifiez vos messages et votre boîte mail (y compris les spams).
          </p>

          <Link href={`/${hotel}`}>
            <Button>Nouvelle réservation</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
