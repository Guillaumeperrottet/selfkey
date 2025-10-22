"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Bed,
  DollarSign,
  MessageSquare,
  Users,
  User,
  Settings,
  QrCode,
  ExternalLink,
  LogOut,
  Menu,
  FileSpreadsheet,
  Car,
  ChevronDown,
  ChevronRight,
  Activity,
  Edit3,
  MapPin,
  Euro,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  subItems?: NavSubItem[];
}

interface NavSubItem {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface AdminSidebarProps {
  hotel: string;
  establishmentName: string;
  isStripeConfigured: boolean;
  stripeAccountId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  enableDayParking?: boolean; // Nouveau prop pour l'état du parking jour
}

const baseNavigation = [
  {
    id: "overview",
    name: "Vue d'ensemble",
    icon: BarChart3,
  },
  {
    id: "bookings",
    name: "Réservations",
    icon: Users,
  },
  {
    id: "rooms",
    name: "Places",
    icon: Bed,
  },
  {
    id: "pricing",
    name: "Options de prix",
    icon: DollarSign,
  },
  {
    id: "form-customizer",
    name: "Formulaire de réservation",
    icon: Edit3,
  },
  {
    id: "confirmations",
    name: "Confirmations",
    icon: MessageSquare,
  },
  {
    id: "access-codes",
    name: "Codes d'accès",
    icon: QrCode,
  },
  {
    id: "export-excel",
    name: "Export Excel",
    icon: FileSpreadsheet,
  },
  {
    id: "payment-report",
    name: "Rapport de paiements",
    icon: Receipt,
  },
  {
    id: "tourist-tax",
    name: "Taxes de séjour",
    icon: Euro,
  },
  {
    id: "settings",
    name: "Paramètres",
    icon: Settings,
  },
];

// Navigation parking jour (visible seulement si activé)
const dayParkingNavigation = {
  id: "day-parking",
  name: "Parking Jour",
  icon: Car,
  subItems: [
    {
      id: "day-parking-manager",
      name: "Gestion des tarifs",
      icon: DollarSign,
    },
    {
      id: "day-parking-email",
      name: "Email de confirmation",
      icon: MessageSquare,
    },
    {
      id: "day-parking-control",
      name: "Contrôle parking",
      icon: Activity,
    },
    {
      id: "day-parking-stats",
      name: "Statistiques",
      icon: BarChart3,
    },
  ],
};

export function AdminSidebar({
  hotel,
  establishmentName,
  isStripeConfigured,
  stripeAccountId,
  activeTab,
  onTabChange,
  enableDayParking = false, // Par défaut désactivé
}: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dayParkingExpanded, setDayParkingExpanded] = useState(false);

  // Construire la navigation dynamiquement selon l'état du parking jour
  const getNavigation = (): NavItem[] => {
    const navigation: NavItem[] = [...baseNavigation];

    // Insérer le parking jour après "Options de prix" si activé
    if (enableDayParking) {
      const pricingIndex = navigation.findIndex(
        (item) => item.id === "pricing"
      );
      navigation.splice(pricingIndex + 1, 0, dayParkingNavigation);
    }

    return navigation;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col" data-tutorial="admin-sidebar">
      {/* Logo et nom */}
      <div className="flex h-16 items-center border-b px-4">
        <Image
          src="/logo.png"
          alt="SelfKey Logo"
          width={24}
          height={24}
          className="rounded"
        />
        <span className="ml-2 text-lg font-semibold truncate">
          {establishmentName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 pt-4">
        {getNavigation().map((item: NavItem) => (
          <div key={item.id}>
            {/* Élément principal */}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === item.id && "bg-muted font-medium"
              )}
              onClick={() => {
                if (item.subItems) {
                  // Si c'est le parking jour, toggle l'expansion
                  if (item.id === "day-parking") {
                    setDayParkingExpanded(!dayParkingExpanded);
                  }
                } else {
                  onTabChange(item.id);
                }
              }}
              data-tutorial={`nav-${item.id}`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
              {item.subItems && (
                <span className="ml-auto">
                  {dayParkingExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </Button>

            {/* Sous-éléments pour parking jour */}
            {item.subItems && dayParkingExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {item.subItems.map((subItem: NavSubItem) => (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      activeTab === subItem.id && "bg-muted font-medium"
                    )}
                    onClick={() => onTabChange(subItem.id)}
                  >
                    <subItem.icon className="mr-2 h-3 w-3" />
                    {subItem.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <Separator />

      {/* Actions rapides */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
          data-tutorial="qr-code-link"
        >
          <Link href={`/admin/${hotel}/qr-code`}>
            <QrCode className="mr-2 h-4 w-4" />
            Code QR
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link href={`/${hotel}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Page de réservation
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
          data-tutorial="location-link"
        >
          <Link href={`/admin/${hotel}/location`}>
            <MapPin className="mr-2 h-4 w-4" />
            Localisation
          </Link>
        </Button>

        {isStripeConfigured && stripeAccountId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            asChild
            data-tutorial="stripe-dashboard"
          >
            <a
              href={`https://dashboard.stripe.com/connect/accounts/${stripeAccountId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
          data-tutorial="back-to-establishments"
        >
          <Link href="/establishments">
            <LogOut className="mr-2 h-4 w-4" />
            Retour aux établissements
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Mon Profil
          </Link>
        </Button>
      </div>

      {/* Statut Stripe */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Paiements</span>
          <Badge variant={isStripeConfigured ? "default" : "secondary"}>
            {isStripeConfigured ? "Activé" : "Configuration requise"}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
