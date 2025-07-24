"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Car,
  DollarSign,
  BarChart3,
  CheckCircle,
  Settings,
  Zap,
} from "lucide-react";

interface DayParkingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DayParkingSetupModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DayParkingSetupModalProps) {
  const features = [
    {
      icon: Car,
      title: "Gestion des réservations parking jour",
      description:
        "Vos clients pourront réserver une place de parking à l'heure ou à la journée",
      benefits: [
        "Réservations flexibles (1h à journée complète)",
        "Plaque d'immatriculation obligatoire",
        "Confirmation automatique par email",
      ],
    },
    {
      icon: DollarSign,
      title: "Tarification personnalisée",
      description:
        "Configurez vos tarifs horaires et votre commission spéciale parking jour",
      benefits: [
        "Tarifs différenciés par durée",
        "Commission réduite (5% par défaut)",
        "Pas de frais fixes",
      ],
    },
    {
      icon: BarChart3,
      title: "Statistiques et contrôle",
      description: "Suivez vos performances et gérez les accès en temps réel",
      benefits: [
        "Tableau de bord dédié",
        "Statistiques de revenus",
        "Contrôle des véhicules présents",
      ],
    },
    {
      icon: Zap,
      title: "Intégration automatique",
      description: "Tout sera configuré automatiquement dans votre interface",
      benefits: [
        "Nouvelle section 'Parking Jour' dans la sidebar",
        "QR code mis à jour",
        "Templates email adaptés",
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Car className="h-6 w-6 text-blue-600" />
            Activer le Parking Jour
          </DialogTitle>
          <DialogDescription className="text-base">
            Découvrez tout ce qui sera ajouté à votre établissement en activant
            le parking jour
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vue d'ensemble */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                Ce qui va changer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">
                    Interface d&apos;administration
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>
                      • Nouvelle section &quot;Parking Jour&quot; dans la
                      sidebar
                    </li>
                    <li>• Gestion des tarifs horaires</li>
                    <li>• Contrôle des véhicules présents</li>
                    <li>• Statistiques dédiées</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">
                    Expérience client
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Choix parking jour/nuit sur votre QR code</li>
                    <li>
                      • Réservation à l&apos;heure (1h à journée complète)
                    </li>
                    <li>• Paiement sécurisé (TWINT, cartes, Apple Pay)</li>
                    <li>• Confirmation automatique par email</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configuration par défaut */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Settings className="h-5 w-5" />
                Configuration par défaut
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    Commission
                  </Badge>
                  <p className="text-2xl font-bold text-green-700">5%</p>
                  <p className="text-sm text-green-600">commission modulable</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    Frais fixes
                  </Badge>
                  <p className="text-2xl font-bold text-green-700">0 CHF</p>
                  <p className="text-sm text-green-600">
                    Pas de frais supplémentaires
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    Durées
                  </Badge>
                  <p className="text-2xl font-bold text-green-700">1h - 24h</p>
                  <p className="text-sm text-green-600">Flexibilité maximale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note importante */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-800 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">À savoir</h4>
                  <p className="text-sm text-amber-700">
                    Vous pourrez désactiver cette fonctionnalité à tout moment
                    dans les paramètres. Les tarifs et commissions sont
                    entièrement configurables après activation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Activation en cours..." : "Activer le Parking Jour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
