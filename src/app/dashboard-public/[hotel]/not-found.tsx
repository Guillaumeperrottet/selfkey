import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Shield } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Accès non autorisé</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Cette page n&apos;existe pas ou vous n&apos;avez pas les permissions
            nécessaires pour y accéder.
          </p>
          <p className="text-sm text-gray-500">
            Vérifiez que vous avez le bon lien de partage ou contactez
            l&apos;administrateur.
          </p>
          <Link href="/">
            <Button className="w-full flex items-center gap-2">
              <Home className="h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
