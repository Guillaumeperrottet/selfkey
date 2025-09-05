import InteractiveMap from "@/components/ui/interactive-map";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-vintage-gray sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-vintage-teal hover:text-vintage-teal-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour à l&apos;accueil</span>
          </Link>
          <h1 className="text-xl font-bold text-vintage-black">
            Carte des emplacements
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Map Container */}
      <div className="h-[calc(100vh-80px)]">
        <InteractiveMap />
      </div>
    </div>
  );
}
